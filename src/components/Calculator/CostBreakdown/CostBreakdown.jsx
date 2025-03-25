import React from 'react';
import { calculateTotal } from '../calculatorFunctions';
import styles from './CostBreakdown.module.css';

export default function CostBreakdown({ categories, settings }) {
  // Calculate totals using imported function
  const totals = calculateTotal(
    categories || [],
    settings?.taxRate || 0,
    settings?.transportationFee || 0,
    settings?.wasteFactor || 0,
    settings?.miscFees || [],
    settings?.markup || 0
  );

  // Detailed category calculations
  const categoryBreakdowns = categories.map((cat) => {
    const materialCost = cat.workItems.reduce((sum, item) => {
      const quantity = item.surfaces?.reduce((s, surf) => s + (parseFloat(surf.sqft) || 0), 0) ||
                      parseFloat(item.linearFt) || 
                      parseFloat(item.units) || 
                      1;
      return sum + (parseFloat(item.materialCost) || 0) * quantity;
    }, 0);

    const laborCost = cat.workItems.reduce((sum, item) => {
      const quantity = item.surfaces?.reduce((s, surf) => s + (parseFloat(surf.sqft) || 0), 0) ||
                      parseFloat(item.linearFt) || 
                      parseFloat(item.units) || 
                      1;
      return sum + (parseFloat(item.laborCost) || 0) * quantity;
    }, 0);

    return { 
      name: cat.name, 
      materialCost, 
      laborCost, 
      subtotal: materialCost + laborCost,
      itemCount: cat.workItems.length 
    };
  });

  // Detailed total calculations
  const baseMaterialCost = totals.materialCost || 0;
  const baseLaborCost = totals.laborCost || 0;
  const baseSubtotal = baseMaterialCost + baseLaborCost;
  const wasteCost = baseSubtotal * (settings?.wasteFactor || 0);
  const taxAmount = baseSubtotal * (settings?.taxRate || 0);
  const markupAmount = baseSubtotal * (settings?.markup || 0);
  const miscFeesTotal = settings?.miscFees?.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0) || 0;
  const transportationFee = totals.transportationFee || 0;
  const grandTotal = baseSubtotal + wasteCost + taxAmount + markupAmount + miscFeesTotal + transportationFee;
  const deposit = settings?.deposit || 0;
  const adjustedGrandTotal = Math.max(0, grandTotal - deposit);
  const amountPaid = settings?.amountPaid || 0;
  const remainingBalance = Math.max(0, adjustedGrandTotal - amountPaid);
  const overpayment = amountPaid > adjustedGrandTotal ? amountPaid - adjustedGrandTotal : 0;

  return (
    <div className={styles.costBreakdown}>
      <h3 className={styles.sectionTitle}>Comprehensive Cost Analysis</h3>

      {/* Category Breakdown Section */}
      {categories.length > 0 && (
        <section className={styles.categorySection}>
          <h4 className={styles.subSectionTitle}>Category-wise Cost Distribution</h4>
          <table className={styles.breakdownTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Materials ($)</th>
                <th>Labor ($)</th>
                <th>Subtotal ($)</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdowns.map((cat, index) => (
                <tr key={index}>
                  <td>{cat.name}</td>
                  <td>{cat.itemCount}</td>
                  <td>${cat.materialCost.toFixed(2)}</td>
                  <td>${cat.laborCost.toFixed(2)}</td>
                  <td>${cat.subtotal.toFixed(2)}</td>
                </tr>
              ))}
              <tr className={styles.categoryTotal}>
                <td>Total</td>
                <td>{categoryBreakdowns.reduce((sum, cat) => sum + cat.itemCount, 0)}</td>
                <td>${baseMaterialCost.toFixed(2)}</td>
                <td>${baseLaborCost.toFixed(2)}</td>
                <td>${baseSubtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Detailed Cost Calculation Section */}
      <section className={styles.totalSection}>
        <h4 className={styles.subSectionTitle}>Detailed Cost Computation</h4>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr>
              <td>1. Base Material Cost</td>
              <td>= ${baseMaterialCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td>2. Base Labor Cost</td>
              <td>= ${baseLaborCost.toFixed(2)}</td>
            </tr>
            <tr className={styles.subtotalRow}>
              <td>Base Subtotal (1 + 2)</td>
              <td>= ${baseMaterialCost.toFixed(2)} + ${baseLaborCost.toFixed(2)} = ${baseSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>3. Waste Cost ({(settings?.wasteFactor * 100 || 0).toFixed(2)}%)</td>
              <td>= ${baseSubtotal.toFixed(2)} × {(settings?.wasteFactor || 0).toFixed(4)} = ${wasteCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td>4. Tax ({(settings?.taxRate * 100 || 0).toFixed(2)}%)</td>
              <td>= ${baseSubtotal.toFixed(2)} × ${(settings?.taxRate || 0).toFixed(4)} = ${taxAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>5. Markup ({(settings?.markup * 100 || 0).toFixed(2)}%)</td>
              <td>= ${baseSubtotal.toFixed(2)} × ${(settings?.markup || 0).toFixed(4)} = ${markupAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>6. Transportation Fee</td>
              <td>= ${transportationFee.toFixed(2)}</td>
            </tr>
            {miscFeesTotal > 0 && (
              <tr>
                <td>7. Miscellaneous Fees</td>
                <td>
                  {settings.miscFees.map((fee, i) => (
                    <div key={i} className={styles.miscFee}>
                      • {fee.description}: ${parseFloat(fee.amount).toFixed(2)}
                    </div>
                  ))}
                  = ${miscFeesTotal.toFixed(2)}
                </td>
              </tr>
            )}
            <tr className={styles.grandTotalRow}>
              <td>Grand Total (1 + 2 + 3 + 4 + 5 + 6 + {miscFeesTotal > 0 ? '7' : ''})</td>
              <td>= ${baseSubtotal.toFixed(2)} + ${wasteCost.toFixed(2)} + ${taxAmount.toFixed(2)} + ${markupAmount.toFixed(2)} + ${transportationFee.toFixed(2)}{miscFeesTotal > 0 ? ` + ${miscFeesTotal.toFixed(2)}` : ''} = ${grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Payment Summary Section */}
      <section className={styles.paymentSection}>
        <h4 className={styles.subSectionTitle}>Payment Summary</h4>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr>
              <td>Grand Total (Before Deposit)</td>
              <td>= ${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deposit/Down Payment</td>
              <td>- ${deposit.toFixed(2)}</td>
            </tr>
            <tr className={styles.subtotalRow}>
              <td>Adjusted Grand Total</td>
              <td>= ${grandTotal.toFixed(2)} - ${deposit.toFixed(2)} = ${adjustedGrandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount Paid</td>
              <td>- ${amountPaid.toFixed(2)}</td>
            </tr>
            <tr className={styles.grandTotalRow}>
              <td>Remaining Balance</td>
              <td>= ${adjustedGrandTotal.toFixed(2)} - ${amountPaid.toFixed(2)} = ${remainingBalance.toFixed(2)}</td>
            </tr>
            {overpayment > 0 && (
              <tr className={styles.overpaymentRow}>
                <td>Overpayment</td>
                <td>= ${amountPaid.toFixed(2)} - ${adjustedGrandTotal.toFixed(2)} = ${overpayment.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}