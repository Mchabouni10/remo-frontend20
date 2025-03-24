// src/components/Calculator/WorkItem/WorkItem4.jsx
import React, { useState } from 'react';
import styles from './WorkItem.module.css';
import { WORK_TYPES } from '../calculatorFunctions';

export default function WorkItem4({ workItem, updateWorkItem, removeWorkItem, disabled }) {
  const [materialManual, setMaterialManual] = useState(false);
  const [laborManual, setLaborManual] = useState(false);

  const materialLabel = WORK_TYPES.surfaceBased.includes(workItem.type)
    ? 'Material Cost per Sqft ($)'
    : WORK_TYPES.linearFtBased.includes(workItem.type)
    ? 'Material Cost per Linear Ft ($)'
    : 'Material Cost per Unit ($)';
  const laborLabel = WORK_TYPES.surfaceBased.includes(workItem.type)
    ? 'Labor Cost per Sqft ($)'
    : WORK_TYPES.linearFtBased.includes(workItem.type)
    ? 'Labor Cost per Linear Ft ($)'
    : 'Labor Cost per Unit ($)';

  const materialCost = parseFloat(workItem.materialCost) || 0;
  const laborCost = parseFloat(workItem.laborCost) || 0;

  const costOptions = [
    ...Array.from({ length: 20 }, (_, i) => (i + 1).toString()),
    'Manual'
  ];

  const handleMaterialChange = (value) => {
    if (value === 'Manual') {
      setMaterialManual(true);
      updateWorkItem('materialCost', '0');
    } else {
      setMaterialManual(false);
      updateWorkItem('materialCost', value);
    }
  };

  const handleLaborChange = (value) => {
    if (value === 'Manual') {
      setLaborManual(true);
      updateWorkItem('laborCost', '0');
    } else {
      setLaborManual(false);
      updateWorkItem('laborCost', value);
    }
  };

  return (
    <div className={styles.pricingSection}>
      <div className={styles.pricingField}>
        <label>{materialLabel}:</label>
        <div className={styles.priceInputContainer}>
          {!materialManual ? (
            <select
              value={isNaN(materialCost) || materialCost > 20 || materialCost < 1 ? 'Manual' : materialCost.toString()}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className={styles.input}
              disabled={disabled}
            >
              {costOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'Manual' ? 'Manual' : `$${option}`}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={materialCost}
              onChange={(e) => updateWorkItem('materialCost', e.target.value)}
              className={styles.input}
              min="0"
              step="0.01"
              disabled={disabled}
            />
          )}
        </div>
      </div>
      <div className={styles.pricingField}>
        <label>{laborLabel}:</label>
        <div className={styles.priceInputContainer}>
          {!laborManual ? (
            <select
              value={isNaN(laborCost) || laborCost > 20 || laborCost < 1 ? 'Manual' : laborCost.toString()}
              onChange={(e) => handleLaborChange(e.target.value)}
              className={styles.input}
              disabled={disabled}
            >
              {costOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'Manual' ? 'Manual' : `$${option}`}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={laborCost}
              onChange={(e) => updateWorkItem('laborCost', e.target.value)}
              className={styles.input}
              min="0"
              step="0.01"
              disabled={disabled}
            />
          )}
        </div>
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