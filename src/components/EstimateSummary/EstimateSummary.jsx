// src/components/EstimateSummary/EstimateSummary.jsx
import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import printJS from 'print-js';
import { calculateTotal, calculateWorkCost } from '../Calculator/calculatorFunctions';
import styles from './EstimateSummary.module.css';

export default function EstimateSummary({ customer, categories, settings }) {
  const componentRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintClick = async () => {
    console.log('Print button clicked');
    console.log('Current customer:', customer);
    console.log('Current categories:', categories);
    console.log('Current settings:', settings);

    const hasCustomerInfo = customer.firstName || customer.lastName || customer.street;
    const hasCategories = categories.length > 0;

    if (!hasCustomerInfo && !hasCategories) {
      alert('Nothing to print. Please add customer info or work items first.');
      console.warn('Print aborted: No customer info or categories');
      return;
    }

    if (!componentRef.current) {
      console.error('handlePrintClick - Cannot print: componentRef is null');
      alert('Error: Unable to print at this time.');
      return;
    }

    console.log('Proceeding with print...');
    setIsPrinting(true);

    try {
      // Capture the content as an image with custom dimensions for one page (e.g., US Letter size: 8.5in x 11in)
      const canvas = await html2canvas(componentRef.current, {
        scale: 1, // Adjust scale for clarity (1 is usually sufficient for print)
        width: 816, // 8.5in * 96dpi (standard screen DPI)
        height: 1056, // 11in * 96dpi
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
      });

      // Convert to data URL
      const image = canvas.toDataURL('image/png');

      // Print using print-js with styling options
      printJS({
        printable: image,
        type: 'image',
        documentTitle: `${customer.projectName || 'Estimate'} - ${new Date().toLocaleDateString()}`,
        style: `
          @media print {
            img {
              width: 100%;
              height: auto;
              page-break-inside: avoid;
            }
            @page {
              size: letter;
              margin: 0.5in;
            }
          }
        `,
        onPrintDialogClose: () => {
          console.log('Print dialog closed');
          setIsPrinting(false);
        },
      });
    } catch (error) {
      console.error('Print error:', error);
      alert('Error: Unable to print at this time.');
      setIsPrinting(false);
    }
  };

  const {
    materialCost,
    laborCost,
    wasteCost,
    transportationFee: transportationFeeTotal,
    tax,
    total,
  } = calculateTotal(categories, settings.taxRate, settings.transportationFee, settings.wasteFactor, settings.miscFees);

  return (
    <div>
      <div className={styles.summary} ref={componentRef}>
        <div className={styles.header}>
          <h3 className={styles.totalTitle}>Estimate Breakdown</h3>
          <div className={styles.customerInfo}>
            <p><strong>{customer.firstName} {customer.lastName}</strong></p>
            <p>{customer.street}{customer.unit ? `, Unit ${customer.unit}` : ''}</p>
            <p>{customer.state} {customer.zipCode}</p>
            <p>Phone: +{customer.phone}</p>
            {customer.email && <p>Email: {customer.email}</p>}
            {customer.projectName && <p>Project: {customer.projectName}</p>}
            <p>Type: {customer.type}</p>
            <p>Payment: {customer.paymentType}</p>
            <p>Start: {customer.startDate}</p>
            <p>Finish: {customer.finishDate}</p>
            {customer.notes && <p>Notes: {customer.notes}</p>}
          </div>
        </div>
        {categories.length > 0 ? (
          <div className={styles.breakdown}>
            {categories.map((cat, index) => (
              <div key={index} className={styles.categoryBreakdown}>
                <h4 className={styles.categoryName}>{cat.name}</h4>
                <table className={styles.workTable}>
                  <thead>
                    <tr>
                      <th>Work Item</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.workItems.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name || 'Unnamed Work'} {item.notes && `(${item.notes})`}</td>
                        <td>${calculateWorkCost(item).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.categoryTotal}>
                  Subtotal: $
                  {cat.workItems
                    .reduce((sum, item) => sum + parseFloat(calculateWorkCost(item) || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noItems}>No work items added yet.</p>
        )}
        <div className={styles.grandTotal}>
          <table className={styles.totalTable}>
            <tbody>
              <tr><td>Material Cost:</td><td>${materialCost.toFixed(2)}</td></tr>
              <tr><td>Labor Cost:</td><td>${laborCost.toFixed(2)}</td></tr>
              <tr><td>Waste Cost:</td><td>${wasteCost.toFixed(2)}</td></tr>
              <tr><td>Transportation Fee:</td><td>${transportationFeeTotal.toFixed(2)}</td></tr>
              <tr><td>Tax:</td><td>${tax.toFixed(2)}</td></tr>
              <tr><td>Miscellaneous Fees:</td><td>${settings.miscFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0).toFixed(2)}</td></tr>
              <tr><td><strong>Grand Total:</strong></td><td><strong>${total.toFixed(2)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <button onClick={handlePrintClick} className={styles.printButton} disabled={isPrinting}>
        {isPrinting ? 'Printing...' : 'Print Estimate'}
      </button>
    </div>
  );
}