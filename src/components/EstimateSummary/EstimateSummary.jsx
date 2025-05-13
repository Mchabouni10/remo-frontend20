//src/components/EstimateSummary/EstimateSummary.jsx

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faArrowLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getUnits, getUnitLabel } from '../Calculator/utils/calculatorUtils';
import { calculateTotal } from '../Calculator/calculations/costCalculations';
import { getProject } from '../../services/projectService';
import styles from './EstimateSummary.module.css';
import logoImage from '../../assets/CompanyLogo.png';

export default function EstimateSummary() {
  const componentRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProject = async () => {
      if (!id) {
        navigate('/home/customers');
        return;
      }
      try {
        const project = await getProject(id);
        if (!project || !project.customerInfo) throw new Error('Project data is incomplete');

        const normalizedCustomer = {
          firstName: project.customerInfo.firstName || '',
          lastName: project.customerInfo.lastName || '',
          street: project.customerInfo.street || '',
          unit: project.customerInfo.unit || '',
          state: project.customerInfo.state || 'IL',
          zipCode: project.customerInfo.zipCode || '',
          phone: project.customerInfo.phone || '',
          email: project.customerInfo.email || '',
          projectName: project.customerInfo.projectName || '',
          type: project.customerInfo.type || 'Residential',
          paymentType: project.customerInfo.paymentType || 'Cash',
          startDate: project.customerInfo.startDate
            ? new Date(project.customerInfo.startDate).toISOString().split('T')[0]
            : '',
          finishDate: project.customerInfo.finishDate
            ? new Date(project.customerInfo.finishDate).toISOString().split('T')[0]
            : '',
          notes: project.customerInfo.notes || '',
        };
        setCustomer(normalizedCustomer);
        setCategories(project.categories || []);
        setSettings(project.settings || {
          taxRate: 0,
          transportationFee: 0,
          wasteFactor: 0,
          miscFees: [],
          deposit: 0,
          payments: [],
          markup: 0,
          laborDiscount: 0,
        });
      } catch (err) {
        console.error('Error loading project:', err);
        alert('Failed to load project.');
        navigate('/home/customers');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id, navigate]);

  // Memoized calculations for category breakdowns
  const categoryBreakdowns = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.map((cat) => {
      if (!cat.workItems || !Array.isArray(cat.workItems)) {
        return { name: cat.name || 'Unnamed', materialCost: 0, laborCost: 0, subtotal: 0, itemCount: 0 };
      }
      const materialCost = cat.workItems.reduce((sum, item) => {
        return sum + (parseFloat(item.materialCost) || 0) * getUnits(item);
      }, 0);
      const laborCost = cat.workItems.reduce((sum, item) => {
        return sum + (parseFloat(item.laborCost) || 0) * getUnits(item);
      }, 0);
      return {
        name: cat.name,
        materialCost,
        laborCost,
        subtotal: materialCost + laborCost,
        itemCount: cat.workItems.length,
      };
    });
  }, [categories]);

  // Memoized material breakdown
  const materialBreakdown = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    const breakdown = [];
    categories.forEach((cat) => {
      (cat.workItems || []).forEach((item) => {
        const quantity = getUnits(item);
        const unitType = getUnitLabel(item);
        const materialCost = (parseFloat(item.materialCost) || 0) * quantity;
        breakdown.push({
          category: cat.name,
          name: item.name || 'Unnamed Item',
          type: item.type || '',
          subtype: item.subtype || '',
          quantity,
          unitType,
          costPerUnit: parseFloat(item.materialCost) || 0,
          total: materialCost,
        });
      });
    });
    return breakdown;
  }, [categories]);

  // Memoized labor breakdown
  const laborBreakdown = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    const breakdown = [];
    categories.forEach((cat) => {
      (cat.workItems || []).forEach((item) => {
        const quantity = getUnits(item);
        const unitType = getUnitLabel(item);
        const laborCost = (parseFloat(item.laborCost) || 0) * quantity;
        breakdown.push({
          category: cat.name,
          name: item.name || 'Unnamed Item',
          type: item.type || '',
          subtype: item.subtype || '',
          quantity,
          unitType,
          costPerUnit: parseFloat(item.laborCost) || 0,
          total: laborCost,
        });
      });
    });
    return breakdown;
  }, [categories]);

  // Memoized totals
  const totals = useMemo(() =>
    calculateTotal(
      categories,
      settings?.taxRate || 0,
      settings?.transportationFee || 0,
      settings?.wasteFactor || 0,
      settings?.miscFees || [],
      settings?.markup || 0,
      settings?.laborDiscount || 0
    ),
    [categories, settings]
  );

  // Memoized misc fees total
  const miscFeesTotal = useMemo(() =>
    (settings?.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0),
    [settings?.miscFees]
  );

  // Memoized payment details
  const paymentDetails = useMemo(() => {
    const payments = settings?.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + (p.isPaid ? parseFloat(p.amount) || 0 : 0), 0) + (settings?.deposit || 0);
    const totalDue = payments.reduce((sum, p) => sum + (!p.isPaid ? parseFloat(p.amount) || 0 : 0), 0);
    return { totalPaid, totalDue };
  }, [settings?.payments, settings?.deposit]);

  // Detailed total calculations
  const baseMaterialCost = totals.materialCost || 0;
  const baseLaborCost = totals.laborCost || 0; // Post-discount labor cost
  const laborDiscount = totals.laborDiscount || 0; // Dollar amount of labor discount
  const baseSubtotal = baseMaterialCost + baseLaborCost;
  const wasteCost = baseSubtotal * (settings?.wasteFactor || 0);
  const taxAmount = baseSubtotal * (settings?.taxRate || 0);
  const markupAmount = baseSubtotal * (settings?.markup || 0);
  const transportationFee = totals.transportationFee || 0;
  const grandTotal = baseSubtotal + wasteCost + taxAmount + markupAmount + miscFeesTotal + transportationFee;
  const adjustedGrandTotal = Math.max(0, grandTotal - (settings?.deposit || 0));
  const remainingBalance = Math.max(0, adjustedGrandTotal - paymentDetails.totalPaid);
  const overpayment = paymentDetails.totalPaid > adjustedGrandTotal ? paymentDetails.totalPaid - adjustedGrandTotal : 0;

  // Formatters
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  const generatePDF = async () => {
    if (!componentRef.current) throw new Error('Component not ready for PDF generation.');

    const element = componentRef.current;
    element.style.display = 'block';
    element.style.visibility = 'visible';
    element.style.width = '595px'; // A4 width in pixels at 72 DPI
    element.style.padding = '15mm'; // Increased margin for better printing
    element.style.boxSizing = 'border-box';

    // Ensure content fits within A4 height with margins
    const sections = element.querySelectorAll(`.${styles.section}`);
    sections.forEach((section) => {
      section.style.pageBreakInside = 'avoid';
      section.style.marginBottom = '10mm';
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      width: element.offsetWidth,
      height: element.scrollHeight,
      backgroundColor: '#ffffff',
      logging: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    element.style.display = '';
    element.style.visibility = '';
    element.style.width = '';
    element.style.padding = '';

    return pdf;
  };

  const handlePrintClick = async () => {
    if (!customer && categories.length === 0) {
      alert('Nothing to print. Please add customer info or work items.');
      return;
    }

    setIsPrinting(true);
    try {
      const pdf = await generatePDF();
      pdf.autoPrint();
      pdf.output('dataurlnewwindow');
    } catch (error) {
      console.error('Error during printing:', error);
      alert('Error: Unable to print. Check console for details.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!customer?.email) {
      alert('Customer email is required to send the estimate.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const pdf = await generatePDF();
      const pdfName = `Estimate_${customer.projectName || 'Summary'}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(pdfName);

      const subject = encodeURIComponent('Project Estimate');
      const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(customer.email)}&su=${subject}`;
      window.open(gmailUrl, '_blank');

      alert('PDF downloaded. Please attach the downloaded PDF to the Gmail compose window.');
    } catch (error) {
      console.error('Error preparing email:', error);
      alert('Error: Unable to prepare email. Check console for details.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.loading}>Loading project data...</div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Estimate Summary</h1>
        <div className={styles.summary} ref={componentRef}>
          <div className={styles.companyInfo}>
            <h2 className={styles.companyName}>RAWDAH REMODELING COMPANY</h2>
            <p>Lake in the Hills, IL | (224) 817-3264 | rawdahremodeling@gmail.com</p>
            <img src={logoImage} alt="Rawdah Remodeling Logo" className={styles.logo} />
          </div>

          <div className={styles.header}>
            <h3 className={styles.totalTitle}>Comprehensive Estimate Breakdown</h3>
            <div className={styles.customerInfo}>
              <h4>Customer Information</h4>
              <p><strong>{customer.firstName} {customer.lastName}</strong></p>
              <p>{customer.street}{customer.unit ? `, Unit ${customer.unit}` : ''}</p>
              <p>{customer.state} {customer.zipCode}</p>
              <p>Phone: {customer.phone ? `+${customer.phone}` : 'N/A'}</p>
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.projectName && <p>Project: {customer.projectName}</p>}
              <p>Type: {customer.type}</p>
              <p>Payment: {customer.paymentType}</p>
              <p>Start: {formatDate(customer.startDate)}</p>
              <p>Finish: {formatDate(customer.finishDate)}</p>
            </div>
          </div>

          {categoryBreakdowns.length > 0 && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Category Breakdown</h4>
              <table className={styles.breakdownTable} aria-label="Category Cost Breakdown">
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Items</th>
                    <th scope="col">Material Cost</th>
                    <th scope="col">Labor Cost</th>
                    <th scope="col">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdowns.map((cat, index) => (
                    <tr key={index} className={styles.categoryRow}>
                      <td>{cat.name}</td>
                      <td>{cat.itemCount}</td>
                      <td>{formatCurrency(cat.materialCost)}</td>
                      <td>{formatCurrency(cat.laborCost)}</td>
                      <td className={styles.subtotal}>{formatCurrency(cat.subtotal)}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td>Total</td>
                    <td>{categoryBreakdowns.reduce((sum, cat) => sum + cat.itemCount, 0)}</td>
                    <td>{formatCurrency(baseMaterialCost)}</td>
                    <td>{formatCurrency(baseLaborCost)}</td>
                    <td className={styles.subtotal}>{formatCurrency(baseSubtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {materialBreakdown.length > 0 && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Material Cost Breakdown</h4>
              <table className={styles.breakdownTable} aria-label="Material Cost Breakdown">
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Item</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Unit Cost</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materialBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{item.name} ({item.type}) {item.subtype && `- ${item.subtype}`}</td>
                      <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                      <td>{formatCurrency(item.costPerUnit)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td colSpan={4}>Total Material Cost</td>
                    <td>{formatCurrency(baseMaterialCost)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          {laborBreakdown.length > 0 && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Labor Cost Breakdown</h4>
              <table className={styles.breakdownTable} aria-label="Labor Cost Breakdown">
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Item</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Unit Cost</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laborBreakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{item.name} ({item.type}) {item.subtype && `- ${item.subtype}`}</td>
                      <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                      <td>{formatCurrency(item.costPerUnit)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td colSpan={4}>Total Labor Cost</td>
                    <td>{formatCurrency(baseLaborCost)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Cost Calculation</h4>
            <table className={styles.breakdownTable} aria-label="Cost Calculation">
              <tbody>
                <tr><td>Base Material Cost</td><td>{formatCurrency(baseMaterialCost)}</td></tr>
                <tr><td>Base Labor Cost (after discount)</td><td>{formatCurrency(baseLaborCost)}</td></tr>
                {laborDiscount > 0 && (
                  <tr className={styles.discountRow}>
                    <td>Labor Discount ({((settings?.laborDiscount || 0) * 100).toFixed(1)}%)</td>
                    <td>-{formatCurrency(laborDiscount)}</td>
                  </tr>
                )}
                <tr className={styles.subtotalRow}><td>Base Subtotal</td><td>{formatCurrency(baseSubtotal)}</td></tr>
                <tr><td>Waste ({(settings?.wasteFactor * 100 || 0).toFixed(1)}%)</td><td>{formatCurrency(wasteCost)}</td></tr>
                <tr><td>Tax ({(settings?.taxRate * 100 || 0).toFixed(1)}%)</td><td>{formatCurrency(taxAmount)}</td></tr>
                <tr><td>Markup ({(settings?.markup * 100 || 0).toFixed(1)}%)</td><td>{formatCurrency(markupAmount)}</td></tr>
                <tr><td>Transportation Fee</td><td>{formatCurrency(transportationFee)}</td></tr>
                {miscFeesTotal > 0 && (
                  <tr>
                    <td>Miscellaneous Fees</td>
                    <td>
                      {settings.miscFees.map((fee, i) => (
                        <div key={i}>{fee.name}: {formatCurrency(parseFloat(fee.amount))}</div>
                      ))}
                      <strong>Total: {formatCurrency(miscFeesTotal)}</strong>
                    </td>
                  </tr>
                )}
                <tr className={styles.grandTotalRow}>
                  <td><strong>Grand Total</strong></td>
                  <td><strong>{formatCurrency(grandTotal)}</strong></td>
                </tr>
              </tbody>
            </table>
          </section>

          {(settings?.payments?.length > 0 || settings?.deposit > 0) && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Payment Tracking</h4>
              <table className={styles.breakdownTable} aria-label="Payment Tracking">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method</th>
                    <th scope="col">Status</th>
                    <th scope="col">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.deposit > 0 && (
                    <tr>
                      <td>{formatDate(customer.startDate)}</td>
                      <td>{formatCurrency(settings.deposit)}</td>
                      <td>{customer.paymentType}</td>
                      <td>Paid</td>
                      <td>Initial Deposit</td>
                    </tr>
                  )}
                  {settings.payments.map((payment, index) => (
                    <tr key={index}>
                      <td>{formatDate(payment.date)}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{payment.method || 'N/A'}</td>
                      <td>{payment.isPaid ? 'Paid' : 'Pending'}</td>
                      <td>{payment.note || 'N/A'}</td>
                    </tr>
                  ))}
                  {settings.payments.length > 0 && (
                    <tr className={styles.totalRow}>
                      <td><strong>Total Paid</strong></td>
                      <td><strong>{formatCurrency(paymentDetails.totalPaid)}</strong></td>
                      <td colSpan={3}></td>
                    </tr>
                  )}
                  {paymentDetails.totalDue > 0 && (
                    <tr className={styles.totalRow}>
                      <td><strong>Total Due</strong></td>
                      <td><strong>{formatCurrency(paymentDetails.totalDue)}</strong></td>
                      <td colSpan={3}></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Payment Summary</h4>
            <table className={styles.breakdownTable} aria-label="Payment Summary">
              <tbody>
                <tr><td>Grand Total</td><td>{formatCurrency(grandTotal)}</td></tr>
                <tr><td>Deposit</td><td>-{formatCurrency(settings?.deposit || 0)}</td></tr>
                <tr><td>Adjusted Total</td><td>{formatCurrency(adjustedGrandTotal)}</td></tr>
                <tr><td>Total Paid</td><td>-{formatCurrency(paymentDetails.totalPaid)}</td></tr>
                <tr className={styles.remainingRow}>
                  <td><strong>Remaining Balance</strong></td>
                  <td><strong>{formatCurrency(remainingBalance)}</strong></td>
                </tr>
                {overpayment > 0 && (
                  <tr><td>Overpayment</td><td>{formatCurrency(overpayment)}</td></tr>
                )}
              </tbody>
            </table>
          </section>

          {customer.notes && (
            <section className={styles.section}>
              <h4 className={styles.sectionTitle}>Project Notes</h4>
              <p>{customer.notes}</p>
            </section>
          )}

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Customer Approval</h4>
            <p>By signing below, I, {customer.firstName} {customer.lastName}, acknowledge that I have reviewed and agree to the terms and costs outlined in this estimate provided by Rawdah Remodeling Company.</p>
            <div className={styles.signatureLine}>
              <span>Customer Signature: _______________________________</span>
              <span>Date: ___________________</span>
            </div>
            <div className={styles.signatureLine}>
              <span>Contractor Signature: _____________________________</span>
              <span>Date: ___________________</span>
            </div>
          </section>

          <div className={styles.footer}>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Thank you for choosing Rawdah Remodeling</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={handlePrintClick} className={styles.printButton} disabled={isPrinting}>
            <FontAwesomeIcon icon={faPrint} /> {isPrinting ? 'Printing...' : 'Print'}
          </button>
          <button onClick={handleSendEmail} className={styles.printButton} disabled={isSendingEmail || !customer?.email}>
            <FontAwesomeIcon icon={faEnvelope} /> {isSendingEmail ? 'Preparing Email...' : 'Send by Email'}
          </button>
          <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        </div>
      </div>
    </main>
  );
}