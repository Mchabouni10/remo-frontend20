// src/components/Calculator/WorkItem/WorkItem3.jsx
import React from 'react';
import SurfaceInput from '../SurfaceInput';
import styles from './WorkItem.module.css';
import { WORK_TYPES } from '../calculatorFunctions';

export default function WorkItem3({ workItem, updateWorkItem, addSurface, catIndex, workIndex, setCategories, disabled }) {
  return (
    <>
      {WORK_TYPES.surfaceBased.includes(workItem.type) && (
        <div className={styles.surfaces}>
          {workItem.surfaces.map((surf, surfIndex) => (
            <SurfaceInput
              key={surfIndex}
              catIndex={catIndex}
              workIndex={workIndex}
              surfIndex={surfIndex}
              surface={surf}
              setCategories={setCategories}
              showRemove={workItem.surfaces.length > 1 && !disabled}
              disabled={disabled}
            />
          ))}
          {!disabled && (
            <button onClick={addSurface} className={styles.addSurfaceButton}>
              + Add Surface
            </button>
          )}
        </div>
      )}
      {WORK_TYPES.linearFtBased.includes(workItem.type) && (
        <input
          type="number"
          placeholder="Linear Feet"
          value={workItem.linearFt}
          onChange={(e) => updateWorkItem('linearFt', e.target.value)}
          className={styles.input}
          min="0"
          disabled={disabled}
        />
      )}
      {WORK_TYPES.unitBased.includes(workItem.type) && (
        <input
          type="number"
          placeholder="Number of Units"
          value={workItem.units}
          onChange={(e) => updateWorkItem('units', e.target.value)}
          className={styles.input}
          min="0"
          disabled={disabled}
        />
      )}
    </>
  );
}