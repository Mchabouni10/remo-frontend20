// Manages manual pricing for material and labor costs.
// src/components/Calculator/WorkItem4.jsx
// src/components/Calculator/WorkItem4.jsx
// <span style={{ color: 'green' }}>Manages manual pricing for material and labor costs.</span>
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem4({ workItem, updateWorkItem, useManualPricing, setUseManualPricing, isSurfaceBased, isLinearFtBased, disabled }) {
  const materialLabel = isSurfaceBased ? 'Material Cost per Sqft ($)' : isLinearFtBased ? 'Material Cost per Linear Ft ($)' : 'Material Cost per Unit ($)';
  const laborLabel = isSurfaceBased ? 'Labor Cost per Sqft ($)' : isLinearFtBased ? 'Labor Cost per Linear Ft ($)' : 'Labor Cost per Unit ($)';

  return (
    <div className={styles.pricingSection}>
      {!disabled && (
        <label>
          <input
            type="checkbox"
            checked={useManualPricing}
            onChange={() => setUseManualPricing(!useManualPricing)}
          />
          Manual Pricing
        </label>
      )}
      <div className={styles.pricingField}>
        <label>{materialLabel}:</label>
        <input
          type="number"
          value={workItem.materialCost !== undefined ? workItem.materialCost : (parseFloat(workItem.basePrice) || 0) * 0.6}
          onChange={(e) => updateWorkItem('materialCost', e.target.value)}
          className={styles.input}
          min="0"
          step="0.1"
          disabled={!useManualPricing || disabled}
        />
      </div>
      <div className={styles.pricingField}>
        <label>{laborLabel}:</label>
        <input
          type="number"
          value={workItem.laborCost !== undefined ? workItem.laborCost : (parseFloat(workItem.basePrice) || 0) * 0.4}
          onChange={(e) => updateWorkItem('laborCost', e.target.value)}
          className={styles.input}
          min="0"
          step="0.1"
          disabled={!useManualPricing || disabled}
        />
      </div>
    </div>
  );
}