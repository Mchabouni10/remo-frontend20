// src/components/Calculator/WorkItem2.jsx
// This component is used to display the base price input field in the calculator. It allows the user to input a base price for a work item, and it also allows the user to toggle between manual and automatic pricing.
// Manages base price input (manual or dropdown).
// src/components/Calculator/WorkItem2.jsx
// <span style={{ color: 'green' }}>This component is used to display the base price input field in the calculator. It allows the user to input a base price for a work item, and it also allows the user to toggle between manual and automatic pricing.</span>
// <span style={{ color: 'green' }}>Manages base price input (manual or dropdown).</span>
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem2({ workItem, updateWorkItem, useManualBasePrice, setUseManualBasePrice, isSurfaceBased, isLinearFtBased, disabled }) {
  const priceOptions = Array.from({ length: 41 }, (_, i) => (i * 0.5).toFixed(2));
  const basePriceLabel = isSurfaceBased ? 'Price per Sqft ($)' : isLinearFtBased ? 'Price per Linear Ft ($)' : 'Price per Unit ($)';

  return (
    <div className={styles.pricingField}>
      <label>{basePriceLabel}:</label>
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
          value={workItem.basePrice !== undefined ? workItem.basePrice : '0.00'}
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
      {!disabled && (
        <label>
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