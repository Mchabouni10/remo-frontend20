// src/components/Calculator/CostBreakdown/CostBreakdown.jsx
import React, { useState, useMemo } from 'react';
import { calculateTotal } from '../calculations/costCalculations';
import styles from './CostBreakdown.module.css';

export default function CostBreakdown({ categories, settings }) {
  const [showMaterialDetails, setShowMaterialDetails] = useState(false);
  const [showLaborDetails, setShowLaborDetails] = useState(false);
  const [showMiscDetails, setShowMiscDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Helper functions to determine units and unit labels
  const getUnits = (item) => {
    if (!item?.surfaces || !Array.isArray(item.surfaces)) return 0;
    return item.surfaces.reduce((sum, surf) => {
      if (surf.measurementType === 'linear-foot') {
        return sum + (parseFloat(surf.linearFt) || 0);
      } else if (surf.measurementType === 'by-unit') {
        return sum + (parseFloat(surf.units) || 0);
      } else {
        return sum + (parseFloat(surf.sqft) || 0);
      }
    }, 0);
  };

  const getUnitLabel = (item) => {
    if (!item?.surfaces || !Array.isArray(item.surfaces) || item.surfaces.length === 0) {
      return 'sqft';
    }
    const measurementType = item.surfaces[0]?.measurementType;
    switch (measurementType) {
      case 'linear-foot':
        return 'linear ft';
      case 'by-unit':
        return 'units';
      case 'single-surface':
      case 'room-surface':
      default:
        return 'sqft';
    }
  };

  // Memoized calculations
  const categoryBreakdowns = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    return categories.map((cat) => {
      if (!cat.workItems || !Array.isArray(cat.workItems)) {
        return { name: cat.name || 'Unnamed', materialCost: 0, laborCost: 0, subtotal: 0, itemCount: 0 };
      }
      const materialCost = cat.workItems.reduce((sum, item) => {
        const qty = getUnits(item);
        return sum + (parseFloat(item.materialCost) || 0) * qty;
      }, 0);
      const laborCost = cat.workItems.reduce((sum, item) => {
        const qty = getUnits(item);
        return sum + (parseFloat(item.laborCost) || 0) * qty;
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

  const materialBreakdown = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    const breakdown = [];
    categories.forEach((cat) => {
      (cat.workItems || []).forEach((item) => {
        const quantity = getUnits(item);
        const unitType = getUnitLabel(item);
        const materialCost = (parseFloat(item.materialCost) || 0) * quantity;
        breakdown.push({
          name: item.name || 'Unnamed Item',
          quantity,
          unitType,
          costPerUnit: parseFloat(item.materialCost) || 0,
          total: materialCost,
        });
      });
    });
    return breakdown;
  }, [categories]);

  const laborBreakdown = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    const breakdown = [];
    categories.forEach((cat) => {
      (cat.workItems || []).forEach((item) => {
        const quantity = getUnits(item);
        const unitType = getUnitLabel(item);
        const laborCost = (parseFloat(item.laborCost) || 0) * quantity;
        breakdown.push({
          name: item.name || 'Unnamed Item',
          quantity,
          unitType,
          costPerUnit: parseFloat(item.laborCost) || 0,
          total: laborCost,
        });
      });
    });
    return breakdown;
  }, [categories]);

  const totals = useMemo(() => {
    return calculateTotal(
      categories || [],
      settings?.taxRate || 0,
      settings?.transportationFee || 0,
      settings?.wasteFactor || 0,
      settings?.miscFees || [],
      settings?.markup || 0,
      settings?.laborDiscount || 0
    );
  }, [categories, settings]);

  const totalPaid = useMemo(() => {
    return (settings?.payments || []).reduce((sum, payment) => sum + (payment.isPaid ? payment.amount : 0), 0) + (settings?.deposit || 0);
  }, [settings?.payments, settings?.deposit]);

  // Error handling
  if (!categories || !Array.isArray(categories)) {
    return <div className={styles.error}>No valid categories provided.</div>;
  }

  // Detailed total calculations
  const baseMaterialCost = categoryBreakdowns.reduce((sum, cat) => sum + cat.materialCost, 0);
  const baseLaborCost = categoryBreakdowns.reduce((sum, cat) => sum + cat.laborCost, 0);
  const laborDiscount = totals.laborDiscount || 0;
  const baseSubtotal = baseMaterialCost + baseLaborCost;
  const wasteCost = baseSubtotal * (settings?.wasteFactor || 0);
  const taxAmount = baseSubtotal * (settings?.taxRate || 0);
  const markupAmount = baseSubtotal * (settings?.markup || 0);
  const miscFeesTotal = (settings?.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  const transportationFee = settings?.transportationFee || 0;
  const grandTotal = baseSubtotal + wasteCost + taxAmount + markupAmount + miscFeesTotal + transportationFee;
  const deposit = settings?.deposit || 0;

  const remainingBalance = Math.max(0, grandTotal - totalPaid);
  const overpayment = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  // Currency formatter
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className={styles.costBreakdown}>
      <h3 className={styles.sectionTitle}>Comprehensive Cost Analysis</h3>

      {/* Category Breakdown Section */}
      {categoryBreakdowns.length > 0 && (
        <section className={styles.categorySection}>
          <h4 className={styles.subSectionTitle}>Category Breakdown</h4>
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

      {/* Detailed Cost Calculation Section */}
      <section className={styles.totalSection}>
        <h4 className={styles.subSectionTitle}>Cost Calculation</h4>
        <table className={styles.breakdownTable} aria-label="Detailed Cost Calculation">
          <tbody>
            <tr className={styles.detailRow}>
              <td>
                Base Material Cost
                <button
                  className={styles.toggleButton}
                  onClick={() => setShowMaterialDetails(!showMaterialDetails)}
                  aria-expanded={showMaterialDetails}
                >
                  {showMaterialDetails ? 'Hide' : 'Show'} Details
                </button>
              </td>
              <td>
                <span className={styles.totalValue}>{formatCurrency(baseMaterialCost)}</span>
                {showMaterialDetails && materialBreakdown.length > 0 && (
                  <div className={styles.detailBreakdown}>
                    <table className={styles.innerTable} aria-label="Material Cost Details">
                      <thead>
                        <tr>
                          <th scope="col">Item</th>
                          <th scope="col">Qty</th>
                          <th scope="col">Unit Cost</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialBreakdown.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                            <td>{formatCurrency(item.costPerUnit)}</td>
                            <td>{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </td>
            </tr>
            <tr className={styles.detailRow}>
              <td>
                Base Labor Cost (after discount)
                <button
                  className={styles.toggleButton}
                  onClick={() => setShowLaborDetails(!showLaborDetails)}
                  aria-expanded={showLaborDetails}
                >
                  {showLaborDetails ? 'Hide' : 'Show'} Details
                </button>
              </td>
              <td>
                <span className={styles.totalValue}>{formatCurrency(baseLaborCost)}</span>
                {showLaborDetails && laborBreakdown.length > 0 && (
                  <div className={styles.detailBreakdown}>
                    <table className={styles.innerTable} aria-label="Labor Cost Details">
                      <thead>
                        <tr>
                          <th scope="col">Item</th>
                          <th scope="col">Qty</th>
                          <th scope="col">Unit Cost</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laborBreakdown.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity.toFixed(2)} {item.unitType}</td>
                            <td>{formatCurrency(item.costPerUnit)}</td>
                            <td>{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </td>
            </tr>
            {laborDiscount > 0 && (
              <tr className={styles.discountRow}>
                <td>Labor Discount ({((settings?.laborDiscount || 0) * 100).toFixed(1)}%)</td>
                <td>-{formatCurrency(laborDiscount)}</td>
              </tr>
            )}
            <tr className={styles.subtotalRow}>
              <td>Base Subtotal</td>
              <td>{formatCurrency(baseSubtotal)}</td>
            </tr>
            <tr>
              <td>Waste Cost ({(settings?.wasteFactor * 100 || 0).toFixed(1)}%)</td>
              <td>{formatCurrency(wasteCost)}</td>
            </tr>
            <tr>
              <td>Tax ({(settings?.taxRate * 100 || 0).toFixed(1)}%)</td>
              <td>{formatCurrency(taxAmount)}</td>
            </tr>
            <tr>
              <td>Markup ({(settings?.markup * 100 || 0).toFixed(1)}%)</td>
              <td>{formatCurrency(markupAmount)}</td>
            </tr>
            <tr>
              <td>Transportation Fee</td>
              <td>{formatCurrency(transportationFee)}</td>
            </tr>
            {miscFeesTotal > 0 && (
              <tr className={styles.detailRow}>
                <td>
                  Miscellaneous Fees
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowMiscDetails(!showMiscDetails)}
                    aria-expanded={showMiscDetails}
                  >
                    {showMiscDetails ? 'Hide' : 'Show'} Details
                  </button>
                </td>
                <td>
                  <span className={styles.totalValue}>{formatCurrency(miscFeesTotal)}</span>
                  {showMiscDetails && (
                    <div className={styles.detailBreakdown}>
                      <table className={styles.innerTable} aria-label="Miscellaneous Fees Details">
                        <thead>
                          <tr>
                            <th scope="col">Description</th>
                            <th scope="col">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {settings.miscFees.map((fee, i) => (
                            <tr key={i}>
                              <td>{fee.name || 'Unnamed Fee'}</td>
                              <td>{formatCurrency(parseFloat(fee.amount) || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </td>
              </tr>
            )}
            <tr className={styles.grandTotalRow}>
              <td>Grand Total</td>
              <td>{formatCurrency(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Payment Summary Section */}
      <section className={styles.paymentSection}>
        <h4 className={styles.subSectionTitle}>
          Payment Summary
          <button
            className={styles.toggleButton}
            onClick={() => setShowPaymentDetails(!showPaymentDetails)}
            aria-expanded={showPaymentDetails}
          >
            {showPaymentDetails ? 'Hide' : 'Show'} Details
          </button>
        </h4>
        <table className={styles.breakdownTable} aria-label="Payment Summary">
          <tbody>
            <tr>
              <td>Grand Total</td>
              <td>{formatCurrency(grandTotal)}</td>
            </tr>
            <tr>
              <td>Deposit</td>
              <td>-{formatCurrency(deposit)}</td>
            </tr>
            <tr>
              <td>Total Paid (incl. Deposit)</td>
              <td>-{formatCurrency(totalPaid)}</td>
            </tr>
            <tr className={styles.grandTotalRow}>
              <td>Remaining Balance</td>
              <td className={remainingBalance > 0 ? styles.remaining : styles.paid}>
                {formatCurrency(remainingBalance)}
              </td>
            </tr>
            {overpayment > 0 && (
              <tr className={styles.overpaymentRow}>
                <td>Overpayment</td>
                <td>{formatCurrency(overpayment)}</td>
              </tr>
            )}
          </tbody>
        </table>
        {showPaymentDetails && (
          <div className={styles.detailBreakdown}>
            <h5>Payment Details</h5>
            {(settings.payments || []).length === 0 && deposit === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <table className={styles.innerTable} aria-label="Payment Details">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Method</th>
                    <th scope="col">Note</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposit > 0 && (
                    <tr className={styles.depositRow}>
                      <td>{new Date().toLocaleDateString()}</td>
                      <td>{formatCurrency(deposit)}</td>
                      <td>Deposit</td>
                      <td>Initial Deposit</td>
                      <td>Paid</td>
                    </tr>
                  )}
                  {(settings.payments || []).map((payment, index) => (
                    <tr key={index}>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{payment.method}</td>
                      <td>{payment.note || '-'}</td>
                      <td>{payment.isPaid ? 'Paid' : 'Due'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </div>
  );
}