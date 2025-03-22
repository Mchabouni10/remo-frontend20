// Covers notes and the remove button.
// src/components/Calculator/WorkItem5.jsx
// src/components/Calculator/WorkItem5.jsx
// <span style={{ color: 'green' }}>Covers notes and the remove button.</span>
import React from 'react';
import styles from './WorkItem.module.css';

export default function WorkItem5({ workItem, updateWorkItem, removeWorkItem, disabled }) {
  return (
    <>
      <input
        type="text"
        placeholder="Work Notes"
        value={workItem.notes || ''}
        onChange={(e) => updateWorkItem('notes', e.target.value)}
        className={styles.input}
        disabled={disabled}
      />
      {!disabled && (
        <button onClick={removeWorkItem} className={styles.removeButton}>
          Remove
        </button>
      )}
    </>
  );
}