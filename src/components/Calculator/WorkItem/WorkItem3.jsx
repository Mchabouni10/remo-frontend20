// src/components/Calculator/WorkItem3.jsx
// Handles surface, linear feet, or unit inputs based on type.
// src/components/Calculator/WorkItem3.jsx
// <span style={{ color: 'green' }}>Handles surface, linear feet, or unit inputs based on type.</span>
import React from 'react';
import SurfaceInput from '../SurfaceInput';
import styles from './WorkItem.module.css';

export default function WorkItem3({ workItem, updateWorkItem, addSurface, catIndex, workIndex, setCategories, isSurfaceBased, isLinearFtBased, isUnitBased, disabled }) {
  return (
    <>
      {isSurfaceBased && (
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
      {isLinearFtBased && (
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
      {isUnitBased && (
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