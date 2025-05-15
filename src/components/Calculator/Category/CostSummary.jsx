//src/components/Calculator/Category/CostSummary.jsx
import React, { useState, useMemo } from 'react';
import styles from './CostSummary.module.css';
import { calculateTotal } from '../calculations/costCalculations';

export default function CostSummary({ categories = [], settings = {} }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totals = useMemo(
    () =>
      calculateTotal(
        categories,
        settings.taxRate || 0,
        settings.transportationFee || 0,
        settings.wasteFactor || 0,
        settings.miscFees || [],
        settings.markup || 0,
        settings.laborDiscount || 0
      ),
    [settings, categories]
  );

  const totalPaid = useMemo(() => {
    return (settings.payments || []).reduce((sum, payment) => sum + (payment.isPaid ? payment.amount : 0), 0) + (settings.deposit || 0);
  }, [settings.payments, settings.deposit]);

  // Calculate labor cost before discount
  const laborCostBeforeDiscount = useMemo(() => {
    return categories.reduce((sum, cat) => {
      return sum + cat.workItems.reduce((catSum, item) => {
        const laborCost = parseFloat(item.laborCost) || 0;
        const totalUnits = item.surfaces?.reduce((surfSum, surf) => {
          return surfSum + (surf.measurementType === 'linear-foot'
            ? parseFloat(surf.linearFt) || 0
            : surf.measurementType === 'by-unit'
            ? parseFloat(surf.units) || 0
            : parseFloat(surf.sqft) || 0);
        }, 0) || 0;
        return catSum + laborCost * totalUnits;
      }, 0);
    }, 0);
  }, [categories]);

  const grandTotal = totals.total;
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
            <span className={styles.totalsLabel}>Labor Cost (after discount):</span>
            <span className={styles.totalsValue}>${totals.laborCost.toFixed(2)}</span>
            {totals.laborDiscount > 0 && (
              <>
                <span className={styles.totalsLabel}>Labor Discount:</span>
                <span className={styles.totalsValue}>-${totals.laborDiscount.toFixed(2)}</span>
              </>
            )}
            <span className={styles.totalsLabel}>Waste Cost:</span>
            <span className={styles.totalsValue}>${totals.wasteCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Transportation Fee:</span>
            <span className={styles.totalsValue}>${totals.transportationFee.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Tax:</span>
            <span className={styles.totalsValue}>${totals.tax.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Markup:</span>
            <span className={styles.totalsValue}>${totals.markupCost.toFixed(2)}</span>
            <span className={styles.totalsLabel}>Miscellaneous Fees:</span>
            <span className={styles.totalsValue}>
              ${(settings.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0).toFixed(2)}
            </span>
            <span className={styles.totalsLabel}>Grand Total:</span>
            <span className={styles.totalsValueGrand}>${totals.total.toFixed(2)}</span>
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
