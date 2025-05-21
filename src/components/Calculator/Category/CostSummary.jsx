//src/components/Calculator/Category/CostSummary.jsx
import React, { useState, useMemo } from 'react';
import styles from './CostSummary.module.css';
import { getUnits } from '../utils/calculatorUtils';

export default function CostSummary({ categories = [], settings = {} }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate material and labor costs directly
  const totals = useMemo(() => {
    let materialCost = 0;
    let laborCost = 0;

    categories.forEach((cat) => {
      (cat.workItems || []).forEach((item) => {
        const qty = getUnits(item);
        materialCost += (parseFloat(item.materialCost) || 0) * qty;
        laborCost += (parseFloat(item.laborCost) || 0) * qty;
      });
    });

    const laborDiscount = (settings.laborDiscount || 0) * laborCost;
    const discountedLaborCost = laborCost - laborDiscount;

    const baseSubtotal = materialCost + discountedLaborCost;
    const wasteCost = baseSubtotal * (settings.wasteFactor || 0);
    const tax = baseSubtotal * (settings.taxRate || 0);
    const markupCost = baseSubtotal * (settings.markup || 0);
    const miscFeesTotal = (settings.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    const transportationFee = parseFloat(settings.transportationFee) || 0;

    const total = baseSubtotal + wasteCost + tax + markupCost + miscFeesTotal + transportationFee;

    return {
      materialCost,
      laborCost: discountedLaborCost,
      laborDiscount,
      wasteCost,
      tax,
      markupCost,
      miscFeesTotal,
      transportationFee,
      total,
    };
  }, [categories, settings]);

  // Calculate labor cost before discount
  const laborCostBeforeDiscount = useMemo(() => {
    return categories.reduce((sum, cat) => {
      return sum + (cat.workItems || []).reduce((catSum, item) => {
        const laborCost = parseFloat(item.laborCost) || 0;
        const totalUnits = getUnits(item);
        return catSum + laborCost * totalUnits;
      }, 0);
    }, 0);
  }, [categories]);

  const totalPaid = useMemo(() => {
    const payments = Array.isArray(settings.payments) ? settings.payments : [];
    return payments.reduce((sum, payment) => sum + (payment.isPaid ? parseFloat(payment.amount) || 0 : 0), 0) +
           (parseFloat(settings.deposit) || 0);
  }, [settings.payments, settings.deposit]);

  const grandTotal = totals.total;
  const amountRemaining = Math.max(0, grandTotal - totalPaid);
  const overpayment = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const toggleSection = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <button
          className={styles.toggleButton}
          onClick={toggleSection}
          title={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
        </button>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-calculator"></i> Cost Summary
        </h3>
      </div>
      {isExpanded && (
        <div className={styles.totals}>
          <div className={styles.totalsGrid}>
            <span className={styles.totalsLabel}>Material Cost:</span>
            <span className={styles.totalsValue}>${totals.materialCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Labor Cost (before discount):</span>
            <span className={styles.totalsValue}>${laborCostBeforeDiscount.toFixed(2)}</span>
            {settings.laborDiscount > 0 && (
              <>
                <span className={`${styles.totalsLabel} ${styles.laborDiscountLabel}`}>
                  <i className="fas fa-tags"></i> Labor Discount:
                </span>
                <span className={`${styles.totalsValue} ${styles.laborDiscount}`}>
                  -${totals.laborDiscount.toFixed(2)}
                </span>
              </>
            )}
            <span className={styles.totalsLabel}>Labor Cost (after discount):</span>
            <span className={styles.totalsValue}>${totals.laborCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Waste Cost:</span>
            <span className={styles.totalsValue}>${totals.wasteCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Transportation Fee:</span>
            <span className={styles.totalsValue}>${totals.transportationFee.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Tax:</span>
            <span className={styles.totalsValue}>${totals.tax.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Markup:</span>
            <span className={styles.totalsValue}>${totals.markupCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Miscellaneous Fees:</span>
            <span className={styles.totalsValue}>${totals.miscFeesTotal.toFixed(2)}</span>
            <span className={`${styles.totalsLabel} ${styles.grandTotalLabel}`}>
              <i className="fas fa-sigma"></i> Grand Total:
            </span>
            <span className={styles.totalsValueGrand}>${totals.total.toFixed(2)}</span>
            <span className={`${styles.totalsLabel} ${styles.totalPaidLabel}`}>
              <i className="fas fa-dollar-sign"></i> Total Paid (incl. Deposit):
            </span>
            <span className={`${styles.totalsValue} ${styles.totalPaid}`}>
              ${totalPaid.toFixed(2)}
            </span>
            <span className={`${styles.totalsLabel} ${styles.amountRemainingLabel}`}>
              <i className="fas fa-balance-scale"></i> Amount Remaining:
            </span>
            <span className={`${styles.totalsValue} ${styles.amountRemaining} ${amountRemaining > 0 ? styles.amountRemainingNonZero : ''}`}>
              ${amountRemaining.toFixed(2)}
            </span>
          </div>
          {overpayment > 0 && (
            <div className={styles.overpaymentNotice}>
              <i className="fas fa-exclamation-circle"></i>
              <span>Overpaid by ${overpayment.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
