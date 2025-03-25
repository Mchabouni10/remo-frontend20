// src/components/Calculator/EstimateSummary/EstimateSummary.jsx
import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import printJS from 'print-js';
import { calculateTotal, calculateWorkCost, getUnits, getUnitLabel } from '../Calculator/calculatorFunctions';
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
        console.log('Fetched project:', project);
        if (!project || !project.customerInfo) {
          throw new Error('Project data is incomplete');
        }

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
    const hasCustomerInfo = customer?.firstName || customer?.lastName || customer?.street;
    const hasCategories = categories.length > 0;

    if (!hasCustomerInfo && !hasCategories) {
      alert('Nothing to print. Please add customer info or work items first.');
      return;
    }

    if (!componentRef.current) {
      alert('Error: Unable to print at this time.');
      return;
    }

    setIsPrinting(true);
    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        width: 816,
        height: 1056,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      printJS({
        printable: image,
        type: 'image',
        documentTitle: `${customer?.projectName || 'Estimate'} - ${new Date().toLocaleDateString()}`,
        style: `
          @media print {
            img { width: 100%; height: auto; page-break-inside: avoid; }
            @page { size: letter; margin: 0.5in; }
            body { font-family: Arial, sans-serif; }
          }
        `,
        onPrintDialogClose: () => setIsPrinting(false),
      });
    } catch (error) {
      console.error('Error during printing:', error);
      alert('Error: Unable to print at this time.');
      setIsPrinting(false);
    }
  };

  const totals = calculateTotal(
    categories || [],
    settings?.taxRate || 0,
    settings?.transportationFee || 0,
    settings?.wasteFactor || 0,
    settings?.miscFees || [],
    settings?.markup || 0
  );

  const { materialCost, laborCost, wasteCost, transportationFee, tax, markupCost, total } = totals;
  const adjustedGrandTotal = Math.max(0, total - (settings?.deposit || 0));
  const amountRemaining = Math.max(0, adjustedGrandTotal - (settings?.amountPaid || 0));

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.title}>Estimate Summary</h1>
          <p>Loading project data...</p>
        </div>
      </main>
    );
  }

  if (!customer || !settings) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.title}>Estimate Summary</h1>
          <p>No project data available.</p>
          <div className={styles.buttonGroup}>
            <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
              Back to Customers
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Estimate Summary</h1>
        <div className={styles.summary} ref={componentRef}>
          <div className={styles.header}>
            <div className={styles.companyInfo}>
              <h2 className={styles.companyName}>RAWDAH REMODELING COMPANY</h2>
              <p>Lake in the hills, IL | (224) 817-3264 | rawdahremodeling@gmail.com</p>
            </div>
            <h3 className={styles.totalTitle}>Estimate Breakdown</h3>
            <div className={styles.customerInfo}>
              <h4>Customer Information</h4>
              <p>
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
              </p>
              <p>
                {customer.street}
                {customer.unit ? `, Unit ${customer.unit}` : ''}
              </p>
              <p>
                {customer.state} {customer.zipCode}
              </p>
              <p>Phone: {customer.phone ? `+${customer.phone}` : 'N/A'}</p>
              {customer.email && <p>Email: {customer.email}</p>}
              {customer.projectName && <p>Project: {customer.projectName}</p>}
              <p>Type: {customer.type || 'N/A'}</p>
              <p>Payment: {customer.paymentType || 'N/A'}</p>
              <p>Start Date: {customer.startDate || 'N/A'}</p>
              <p>Finish Date: {customer.finishDate || 'N/A'}</p>
              {customer.notes && <p>Notes: {customer.notes}</p>}
            </div>
          </div>

          {categories.length > 0 ? (
            <div className={styles.breakdown}>
              {categories.map((cat, catIndex) => (
                <div key={catIndex} className={styles.categoryBreakdown}>
                  <h4 className={styles.categoryName}>{cat.name || `Category ${catIndex + 1}`}</h4>
                  <table className={styles.workTable}>
                    <thead>
                      <tr>
                        <th>Work Item</th>
                        <th>Units</th>
                        <th>Material Cost</th>
                        <th>Labor Cost</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.workItems.map((item, itemIndex) => {
                        const units = getUnits(item);
                        const unitLabel = getUnitLabel(item);
                        const materialCost = (parseFloat(item.materialCost) || 0) * units;
                        const laborCost = (parseFloat(item.laborCost) || 0) * units;
                        const subtotal = calculateWorkCost(item);
                        return (
                          <tr key={itemIndex}>
                            <td>
                              {item.name || 'Unnamed Work'} {item.type && `(${item.type})`}
                              {item.subtype && ` - ${item.subtype}`}
                              {item.notes && <span className={styles.notes}> ({item.notes})</span>}
                            </td>
                            <td>
                              {units.toFixed(2)} {unitLabel}
                            </td>
                            <td>
                              {units.toFixed(2)} × ${(parseFloat(item.materialCost) || 0).toFixed(2)} = $
                              {materialCost.toFixed(2)}
                            </td>
                            <td>
                              {units.toFixed(2)} × ${(parseFloat(item.laborCost) || 0).toFixed(2)} = $
                              {laborCost.toFixed(2)}
                            </td>
                            <td>${subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className={styles.categoryTotal}>
                    Category Subtotal: $
                    {(cat.workItems.reduce((sum, item) => sum + (calculateWorkCost(item) || 0), 0) || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noItems}>No work items added yet.</p>
          )}

          <div className={styles.grandTotal}>
            <h4>Total Cost Breakdown</h4>
            <table className={styles.totalTable}>
              <tbody>
                <tr>
                  <td>Material Cost:</td>
                  <td>${(materialCost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Labor Cost:</td>
                  <td>${(laborCost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Waste Cost ({(settings.wasteFactor * 100 || 0).toFixed(2)}%):</td>
                  <td>${(wasteCost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Transportation Fee:</td>
                  <td>${(transportationFee || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Tax ({(settings.taxRate * 100 || 0).toFixed(2)}%):</td>
                  <td>${(tax || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Markup ({(settings.markup * 100 || 0).toFixed(2)}%):</td>
                  <td>${(markupCost || 0).toFixed(2)}</td>
                </tr>
                {settings.miscFees?.length > 0 && (
                  <tr>
                    <td>Miscellaneous Fees:</td>
                    <td>
                      {settings.miscFees.map((fee, i) => (
                        <div key={i} className={styles.miscFee}>
                          {fee.name}: ${(parseFloat(fee.amount) || 0).toFixed(2)}
                        </div>
                      ))}
                      <strong>
                        Total: $
                        {(settings.miscFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0) || 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                )}
                <tr className={styles.grandTotalRow}>
                  <td>
                    <strong>Grand Total (Before Deposit):</strong>
                  </td>
                  <td>
                    <strong>${(total || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className={styles.paymentTracking}>
              <h4>Payment Details</h4>
              <table className={styles.totalTable}>
                <tbody>
                  <tr>
                    <td>Deposit/Down Payment:</td>
                    <td>${(settings.deposit || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Adjusted Grand Total (After Deposit):</td>
                    <td>${adjustedGrandTotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Amount Paid:</td>
                    <td>${(settings.amountPaid || 0).toFixed(2)}</td>
                  </tr>
                  <tr className={styles.remainingRow}>
                    <td>
                      <strong>Amount Remaining:</strong>
                    </td>
                    <td>
                      <strong>${amountRemaining.toFixed(2)}</strong>
                      {settings.amountPaid > adjustedGrandTotal && (
                        <span className={styles.overpaid}>
                          {' '}
                          (Overpaid by ${(settings.amountPaid - adjustedGrandTotal).toFixed(2)})
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.footer}>
            <p>Generated on: {new Date().toLocaleDateString()}</p>
            <p>Thank you for choosing Rawdah Remodeling</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button onClick={handlePrintClick} className={styles.printButton} disabled={isPrinting}>
            <FontAwesomeIcon icon={faPrint} className={styles.buttonIcon} />
            {isPrinting ? 'Printing...' : 'Print Estimate'}
          </button>
          <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
            Back to Customers
          </button>
        </div>
      </div>
    </main>
  );
}