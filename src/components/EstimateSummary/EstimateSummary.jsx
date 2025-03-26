// src/components/Calculator/EstimateSummary/EstimateSummary.jsx
import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import printJS from 'print-js';
import { calculateTotal, getUnits, getUnitLabel } from '../Calculator/calculatorFunctions';
import { getProject } from '../../services/projectService';
import styles from './EstimateSummary.module.css';

export default function EstimateSummary() {
  const componentRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
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
          amountPaid: 0,
          markup: 0,
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

  const handlePrintClick = async () => {
    if (!customer && categories.length === 0) {
      alert('Nothing to print. Please add customer info or work items.');
      return;
    }
    if (!componentRef.current) return;

    setIsPrinting(true);
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        width: 595, // A4 width in pixels at 72 DPI
        height: 842, // A4 height in pixels at 72 DPI
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      });
      const image = canvas.toDataURL('image/png');
      printJS({
        printable: image,
        type: 'image',
        documentTitle: `${customer?.projectName || 'Estimate'} - ${new Date().toLocaleDateString()}`,
        style: '@page { size: A4; margin: 10mm; }',
        onPrintDialogClose: () => setIsPrinting(false),
      });
    } catch (error) {
      console.error('Error during printing:', error);
      alert('Error: Unable to print.');
      setIsPrinting(false);
    }
  };

  const totals = calculateTotal(categories, settings?.taxRate, settings?.transportationFee, settings?.wasteFactor, settings?.miscFees, settings?.markup);
  const baseSubtotal = totals.materialCost + totals.laborCost;
  const miscFeesTotal = settings?.miscFees?.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0) || 0;
  const grandTotal = baseSubtotal + totals.wasteCost + totals.tax + totals.markupCost + totals.transportationFee + miscFeesTotal;
  const adjustedGrandTotal = Math.max(0, grandTotal - (settings?.deposit || 0));
  const remainingBalance = Math.max(0, adjustedGrandTotal - (settings?.amountPaid || 0));
  const overpayment = settings?.amountPaid > adjustedGrandTotal ? settings.amountPaid - adjustedGrandTotal : 0;

  if (loading) return <div className={styles.mainContent}>Loading project data...</div>;

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Estimate Summary</h1>
        <div className={styles.summary} ref={componentRef}>
          <div className={styles.header}>
            <div className={styles.companyInfo}>
              <h2 className={styles.companyName}>RAWDAH REMODELING COMPANY</h2>
              <p>Lake in the Hills, IL | (224) 817-3264 | rawdahremodeling@gmail.com</p>
            </div>
            <h3 className={styles.totalTitle}>Estimate Breakdown</h3>
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
              <p>Start: {customer.startDate || 'N/A'}</p>
              <p>Finish: {customer.finishDate || 'N/A'}</p>
              {customer.notes && <p>Notes: {customer.notes}</p>}
            </div>
          </div>

          {categories.length > 0 && (
            <section className={styles.categorySection}>
              <h4>Category Breakdown</h4>
              {categories.map((cat, index) => {
                const materialCost = cat.workItems.reduce((sum, item) => sum + (parseFloat(item.materialCost) || 0) * getUnits(item), 0);
                const laborCost = cat.workItems.reduce((sum, item) => sum + (parseFloat(item.laborCost) || 0) * getUnits(item), 0);
                return (
                  <div key={index} className={styles.categoryBreakdown}>
                    <h5>{cat.name}</h5>
                    <table className={styles.workTable}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Mat. Cost</th>
                          <th>Labor Cost</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.workItems.map((item, i) => {
                          const units = getUnits(item);
                          const unitLabel = getUnitLabel(item);
                          const matCost = (parseFloat(item.materialCost) || 0) * units;
                          const labCost = (parseFloat(item.laborCost) || 0) * units;
                          return (
                            <tr key={i}>
                              <td>{item.name} ({item.type}) {item.subtype && `- ${item.subtype}`}</td>
                              <td>{units.toFixed(1)} {unitLabel}</td>
                              <td>${matCost.toFixed(2)}</td>
                              <td>${labCost.toFixed(2)}</td>
                              <td>${(matCost + labCost).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        <tr className={styles.categoryTotalRow}>
                          <td colSpan={2}>Subtotal</td>
                          <td>${materialCost.toFixed(2)}</td>
                          <td>${laborCost.toFixed(2)}</td>
                          <td>${(materialCost + laborCost).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
              <table className={styles.totalTable}>
                <tbody>
                  <tr className={styles.totalRow}>
                    <td>Total</td>
                    <td>{categories.reduce((sum, cat) => sum + cat.workItems.length, 0)}</td>
                    <td>${totals.materialCost.toFixed(2)}</td>
                    <td>${totals.laborCost.toFixed(2)}</td>
                    <td>${baseSubtotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          )}

          <section className={styles.totalSection}>
            <h4>Cost Calculation</h4>
            <table className={styles.totalTable}>
              <tbody>
                <tr><td>Base Subtotal</td><td>${baseSubtotal.toFixed(2)}</td></tr>
                <tr><td>Waste ({(settings?.wasteFactor * 100 || 0).toFixed(1)}%)</td><td>${totals.wasteCost.toFixed(2)}</td></tr>
                <tr><td>Tax ({(settings?.taxRate * 100 || 0).toFixed(1)}%)</td><td>${totals.tax.toFixed(2)}</td></tr>
                <tr><td>Markup ({(settings?.markup * 100 || 0).toFixed(1)}%)</td><td>${totals.markupCost.toFixed(2)}</td></tr>
                <tr><td>Transportation</td><td>${totals.transportationFee.toFixed(2)}</td></tr>
                {miscFeesTotal > 0 && (
                  <tr>
                    <td>Misc Fees</td>
                    <td>
                      {settings.miscFees.map((fee, i) => (
                        <div key={i}>{fee.name}: ${parseFloat(fee.amount).toFixed(2)}</div>
                      ))}
                      <strong>Total: ${miscFeesTotal.toFixed(2)}</strong>
                    </td>
                  </tr>
                )}
                <tr className={styles.grandTotalRow}><td><strong>Grand Total</strong></td><td><strong>${grandTotal.toFixed(2)}</strong></td></tr>
              </tbody>
            </table>

            <h4>Payment Summary</h4>
            <table className={styles.totalTable}>
              <tbody>
                <tr><td>Grand Total</td><td>${grandTotal.toFixed(2)}</td></tr>
                <tr><td>Deposit</td><td>-${(settings?.deposit || 0).toFixed(2)}</td></tr>
                <tr><td>Adjusted Total</td><td>${adjustedGrandTotal.toFixed(2)}</td></tr>
                <tr><td>Amount Paid</td><td>-${(settings?.amountPaid || 0).toFixed(2)}</td></tr>
                <tr className={styles.remainingRow}>
                  <td><strong>Remaining Balance</strong></td>
                  <td><strong>${remainingBalance.toFixed(2)}</strong></td>
                </tr>
                {overpayment > 0 && (
                  <tr><td>Overpayment</td><td>${overpayment.toFixed(2)}</td></tr>
                )}
              </tbody>
            </table>
          </section>

          <section className={styles.signatureSection}>
            <h4>Customer Approval</h4>
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
          <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
        </div>
      </div>
    </main>
  );
}