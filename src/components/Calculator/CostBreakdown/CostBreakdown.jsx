import React from 'react';
import { calculateTotal } from '../calculatorFunctions';
import styles from './CostBreakdown.module.css';

export default function CostBreakdown({ categories, settings }) {
  const totals = calculateTotal(
    categories || [],
    settings?.taxRate || 0,
    settings?.transportationFee || 0,
    settings?.wasteFactor || 0,
    settings?.miscFees || [],
    settings?.markup || 0
  );

  const adjustedGrandTotal = Math.max(0, totals.total - (settings?.deposit || 0));

  const categoryBreakdowns = categories.map((cat) => {
    const materialCost = cat.workItems.reduce((sum, item) => sum + (parseFloat(item.materialCost) || 0) * (item.surfaces?.reduce((s, surf) => s + (parseFloat(surf.sqft) || 0), 0) || parseFloat(item.linearFt) || parseFloat(item.units) || 1), 0);
    const laborCost = cat.workItems.reduce((sum, item) => sum + (parseFloat(item.laborCost) || 0) * (item.surfaces?.reduce((s, surf) => s + (parseFloat(surf.sqft) || 0), 0) || parseFloat(item.linearFt) || parseFloat(item.units) || 1), 0);
    const subtotal = materialCost + laborCost;
    return { name: cat.name, materialCost, laborCost, subtotal };
  });

  const baseSubtotal = totals.materialCost + totals.laborCost;

  return (
    <div className={styles.costBreakdown}>
      <h3 className={styles.sectionTitle}>Detailed Cost Breakdown</h3>

      {categories.length > 0 && (
        <div className={styles.categoryBreakdown}>
          <h4 className={styles.subSectionTitle}>By Category</h4>
          <table className={styles.breakdownTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Material Cost</th>
                <th>Labor Cost</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdowns.map((cat, index) => (
                <tr key={index}>
                  <td>{cat.name}</td>
                  <td>${cat.materialCost.toFixed(2)}</td>
                  <td>${cat.laborCost.toFixed(2)}</td>
                  <td>${cat.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.totalBreakdown}>
        <h4 className={styles.subSectionTitle}>Total Costs</h4>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr>
              <td>Base Material Cost:</td>
              <td>${(totals.materialCost || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Base Labor Cost:</td>
              <td>${(totals.laborCost || 0).toFixed(2)}</td>
            </tr>
            <tr className={styles.subtotalRow}>
              <td><strong>Subtotal (Materials + Labor):</strong></td>
              <td><strong>${baseSubtotal.toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td>Waste Cost ({(settings?.wasteFactor * 100 || 0).toFixed(2)}% of Subtotal):</td>
              <td>${(totals.wasteCost || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Transportation Fee:</td>
              <td>${(totals.transportationFee || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax ({(settings?.taxRate * 100 || 0).toFixed(2)}% of Subtotal):</td>
              <td>${(totals.tax || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Markup ({(settings?.markup * 100 || 0).toFixed(2)}% of Subtotal):</td>
              <td>${(totals.markupCost || 0).toFixed(2)}</td>
            </tr>
            {settings?.miscFees?.length > 0 && (
              <tr>
                <td>Miscellaneous Fees:</td>
                <td>
                  {settings.miscFees.map((fee, i) => (
                    <div key={i} className={styles.miscFee}>
                      {fee.description}: ${(parseFloat(fee.amount) || 0).toFixed(2)}
                    </div>
                  ))}
                  <strong>Total Misc: ${(settings.miscFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0) || 0).toFixed(2)}</strong>
                </td>
              </tr>
            )}
            <tr className={styles.grandTotalRow}>
              <td><strong>Grand Total (Before Deposit):</strong></td>
              <td><strong>${(totals.total || 0).toFixed(2)}</strong></td>
            </tr>
            <tr className={styles.grandTotalRow}>
              <td><strong>Adjusted Grand Total (After Deposit):</strong></td>
              <td><strong>${adjustedGrandTotal.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.paymentDetails}>
        <h4 className={styles.subSectionTitle}>Payment Details</h4>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr>
              <td>Deposit/Down Payment:</td>
              <td>${(settings?.deposit || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Total Amount Paid:</td>
              <td>${(settings?.amountPaid || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount Remaining:</td>
              <td>
                ${Math.max(0, adjustedGrandTotal - (settings?.amountPaid || 0)).toFixed(2)}
                {settings?.amountPaid > adjustedGrandTotal && (
                  <span className={styles.overpaid}> (Overpaid by ${(settings.amountPaid - adjustedGrandTotal).toFixed(2)})</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}