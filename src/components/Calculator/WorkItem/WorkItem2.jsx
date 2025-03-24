// src/components/Calculator/WorkItem/WorkItem2.jsx
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem2({ 
  workItem, 
  updateWorkItem, 
  isSurfaceBased, 
  isLinearFtBased, 
  disabled 
}) {
  const subtypeOptions = {
    'kitchen-flooring': ['hardwood', 'laminate', 'vinyl'],
    'kitchen-tiles': ['ceramic', 'porcelain', 'mosaic'],
    'kitchen-backsplash': ['subway', 'glass', 'stone'],
    'bathroom-flooring': ['ceramic', 'porcelain', 'vinyl'],
    'bathroom-tiles': ['ceramic', 'porcelain', 'mosaic'],
    'bathroom-shower-tiles': ['ceramic', 'glass', 'stone'],
    'living-room-flooring': ['hardwood', 'laminate', 'carpet'],
    'bedroom-flooring': ['hardwood', 'laminate', 'carpet'],
    'exterior-deck': ['wood', 'composite', 'tile'],
    'general-drywall': ['standard', 'moisture-resistant'],
    'general-painting': ['matte', 'semi-gloss', 'gloss'],
  };

  return (
    <div className={styles.container}>
      {isSurfaceBased(workItem.type) && (
        <div className={styles.workItemRow}>
          <label>Subtype:</label>
          <select
            value={workItem.subtype || ''}
            onChange={(e) => updateWorkItem('subtype', e.target.value)}
            className={styles.select}
            disabled={disabled}
          >
            <option value="">Select Subtype</option>
            {(subtypeOptions[workItem.type] || []).map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}