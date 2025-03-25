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

  // Work item breakdowns for material and labor costs
  const materialBreakdown = [];
  const laborBreakdown = [];
  categories.forEach((cat) => {
    cat.workItems.forEach((item) => {
      const quantity = item.surfaces?.reduce((s, surf) => s + (parseFloat(surf.sqft) || 0), 0) ||
                      parseFloat(item.linearFt) || 
                      parseFloat(item.units) || 
                      1;
      const unitType = item.surfaces?.length > 0 ? 'sqft' : item.linearFt ? 'linear ft' : 'units';
      const materialCost = (parseFloat(item.materialCost) || 0) * quantity;
      const laborCost = (parseFloat(item.laborCost) || 0) * quantity;

      materialBreakdown.push({
        name: item.name,
        quantity,
        unitType,
        costPerUnit: parseFloat(item.materialCost) || 0,
        total: materialCost,
      });

      laborBreakdown.push({
        name: item.name,
        quantity,
        unitType,
        costPerUnit: parseFloat(item.laborCost) || 0,
        total: laborCost,
      });
    });
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
          <h4 className={styles.subSectionTitle}>Category Breakdown</h4>
          <table className={styles.breakdownTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Material Cost</th>
                <th>Labor Cost</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdowns.map((cat, index) => (
                <tr key={index} className={styles.categoryRow}>
                  <td>{cat.name}</td>
                  <td>{cat.itemCount}</td>
                  <td>${cat.materialCost.toFixed(2)}</td>
                  <td>${cat.laborCost.toFixed(2)}</td>
                  <td className={styles.subtotal}>${cat.subtotal.toFixed(2)}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>Total</td>
                <td>{categoryBreakdowns.reduce((sum, cat) => sum + cat.itemCount, 0)}</td>
                <td>${baseMaterialCost.toFixed(2)}</td>
                <td>${baseLaborCost.toFixed(2)}</td>
                <td className={styles.subtotal}>${baseSubtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Detailed Cost Calculation Section */}
      <section className={styles.totalSection}>
        <h4 className={styles.subSectionTitle}>Cost Calculation</h4>
        <table className={styles.breakdownTable}>
          <tbody>
            <tr className={styles.detailRow}>
              <td>Base Material Cost</td>
              <td>
                <span className={styles.totalValue}>${baseMaterialCost.toFixed(2)}</span>
                {materialBreakdown.length > 0 && (
                  <div className={styles.detailBreakdown}>
                    <table className={styles.innerTable}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Cost</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialBreakdown.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                            <td>${item.costPerUnit.toFixed(2)}</td>
                            <td>${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </td>
            </tr>
            <tr className={styles.detailRow}>
              <td>Base Labor Cost</td>
              <td>
                <span className={styles.totalValue}>${baseLaborCost.toFixed(2)}</span>
                {laborBreakdown.length > 0 && (
                  <div className={styles.detailBreakdown}>
                    <table className={styles.innerTable}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Cost</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laborBreakdown.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                            <td>${item.costPerUnit.toFixed(2)}</td>
                            <td>${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </td>
            </tr>
            <tr className={styles.subtotalRow}>
              <td>Base Subtotal</td>
              <td>${baseSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Waste Cost ({(settings?.wasteFactor * 100 || 0).toFixed(1)}%)</td>
              <td>${wasteCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax ({(settings?.taxRate * 100 || 0).toFixed(1)}%)</td>
              <td>${taxAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Markup ({(settings?.markup * 100 || 0).toFixed(1)}%)</td>
              <td>${markupAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Transportation Fee</td>
              <td>${transportationFee.toFixed(2)}</td>
            </tr>
            {miscFeesTotal > 0 && (
              <tr className={styles.detailRow}>
                <td>Miscellaneous Fees</td>
                <td>
                  <span className={styles.totalValue}>${miscFeesTotal.toFixed(2)}</span>
                  <div className={styles.detailBreakdown}>
                    <table className={styles.innerTable}>
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.miscFees.map((fee, i) => (
                          <tr key={i}>
                            <td>{fee.description}</td>
                            <td>${parseFloat(fee.amount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            )}
            <tr className={styles.grandTotalRow}>
              <td>Grand Total</td>
              <td>${grandTotal.toFixed(2)}</td>
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
              <td>Grand Total</td>
              <td>${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deposit</td>
              <td>-${deposit.toFixed(2)}</td>
            </tr>
            <tr className={styles.subtotalRow}>
              <td>Adjusted Total</td>
              <td>${adjustedGrandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount Paid</td>
              <td>-${amountPaid.toFixed(2)}</td>
            </tr>
            <tr className={styles.grandTotalRow}>
              <td>Remaining Balance</td>
              <td className={remainingBalance > 0 ? styles.remaining : styles.paid}>
                ${remainingBalance.toFixed(2)}
              </td>
            </tr>
            {overpayment > 0 && (
              <tr className={styles.overpaymentRow}>
                <td>Overpayment</td>
                <td>${overpayment.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}