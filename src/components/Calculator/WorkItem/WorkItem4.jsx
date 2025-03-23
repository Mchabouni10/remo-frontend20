// src/components/Calculator/WorkItem45.jsx
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem4({ 
  workItem, 
  updateWorkItem, 
  removeWorkItem, 
  useManualPricing, 
  setUseManualPricing, 
  isSurfaceBased, 
  isLinearFtBased, 
  disabled 
}) {
  const materialLabel = isSurfaceBased 
    ? 'Material Cost per Sqft ($)' 
    : isLinearFtBased 
      ? 'Material Cost per Linear Ft ($)' 
      : 'Material Cost per Unit ($)';
  const laborLabel = isSurfaceBased 
    ? 'Labor Cost per Sqft ($)' 
    : isLinearFtBased 
      ? 'Labor Cost per Linear Ft ($)' 
      : 'Labor Cost per Unit ($)';

  const basePrice = parseFloat(workItem.basePrice) || 0;
  const materialCost = workItem.materialCost ?? (basePrice * 0.6);
  const laborCost = workItem.laborCost ?? (basePrice * 0.4);

  return (
    <div className={styles.pricingSection}>
      {!disabled && (
        <label className={styles.checkboxLabel}>
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
          value={materialCost}
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
          value={laborCost}
          onChange={(e) => updateWorkItem('laborCost', e.target.value)}
          className={styles.input}
          min="0"
          step="0.1"
          disabled={!useManualPricing || disabled}
        />
      </div>
      <div className={styles.notesSection}>
        <input
          type="text"
          placeholder="Work Notes"
          value={workItem.notes || ''}
          onChange={(e) => updateWorkItem('notes', e.target.value)}
          className={styles.input}
          disabled={disabled}
        />
        {!disabled && (
          <button 
            onClick={removeWorkItem} 
            className={styles.removeButton}
            aria-label="Remove work item"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}