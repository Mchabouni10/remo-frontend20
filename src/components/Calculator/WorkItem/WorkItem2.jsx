// src/components/Calculator/WorkItem2.jsx
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem2({ 
  workItem, 
  updateWorkItem, 
  useManualBasePrice, 
  setUseManualBasePrice, 
  isSurfaceBased, 
  isLinearFtBased, 
  disabled 
}) {
  const priceOptions = Array.from({ length: 20 }, (_, i) => (i + 1).toFixed(2));
  const basePriceLabel = isSurfaceBased 
    ? 'Price per Sqft ($)' 
    : isLinearFtBased 
      ? 'Price per Linear Ft ($)' 
      : 'Price per Unit ($)';

  return (
    <div className={styles.pricingField}>
      <label>{basePriceLabel}:</label>
      <div className={styles.priceInputContainer}>
        {useManualBasePrice ? (
          <input
            type="number"
            value={workItem.basePrice || 0}
            onChange={(e) => updateWorkItem('basePrice', e.target.value)}
            className={styles.input}
            min="0"
            step="0.1"
            disabled={disabled}
          />
        ) : (
          <select
            value={workItem.basePrice !== undefined ? workItem.basePrice : '1.00'}
            onChange={(e) => updateWorkItem('basePrice', e.target.value)}
            className={styles.select}
            disabled={disabled}
          >
            {priceOptions.map((price) => (
              <option key={price} value={price}>
                ${price}
              </option>
            ))}
          </select>
        )}
      </div>
      {!disabled && (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={useManualBasePrice}
            onChange={() => setUseManualBasePrice(!useManualBasePrice)}
          />
          Manual
        </label>
      )}
    </div>
  );
}