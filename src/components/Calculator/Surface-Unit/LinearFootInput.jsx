//src/components/Calculator/Surface-Unit/LinearFootInput.jsx
import React from 'react';
import styles from './LinearFootInput.module.css';

export default function LinearFootInput({
  catIndex,
  workIndex,
  surfIndex,
  surface,
  setCategories,
  showRemove,
  disabled = false,
}) {
  const updateSurface = (field, value) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf, measurementType: 'linear-foot' };
                  if (field === 'linearFt') {
                    updated.linearFt = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                  }
                  return updated;
                }
                return surf;
              });
              return { ...item, surfaces: updatedSurfaces };
            }
            return item;
          });
          return { ...cat, workItems: updatedWorkItems };
        }
        return cat;
      })
    );
  };

  const removeSurface = () => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) =>
            j === workIndex
              ? { ...item, surfaces: item.surfaces.filter((_, k) => k !== surfIndex) }
              : item
          );
          return { ...cat, workItems: updatedWorkItems };
        }
        return cat;
      })
    );
  };

  return (
    <div className={styles.surfaceRow}>
      <div className={styles.inputWrapper}>
        <i className={`fas fa-ruler-combined ${styles.inputIcon}`}></i>
        <input
          type="text"
          value="Linear Foot"
          className={styles.input}
          disabled
          title="Measurement type"
          aria-label="Measurement type"
        />
      </div>
      <div className={styles.inputWrapper}>
        <i className={`fas fa-ruler-horizontal ${styles.inputIcon}`}></i>
        <input
          type="number"
          placeholder="Linear Feet"
          value={surface.linearFt || ''}
          onChange={(e) => updateSurface('linearFt', e.target.value)}
          className={styles.input}
          min="0"
          step="0.1"
          disabled={disabled}
          title="Enter the total linear feet"
          aria-label="Linear feet"
        />
      </div>
      <span className={styles.units}>
        <i className={`fas fa-ruler ${styles.unitsIcon}`}></i>
        {(parseFloat(surface.linearFt) || 0).toFixed(2)} ft
      </span>
      {showRemove && !disabled && (
        <button
          onClick={removeSurface}
          className={styles.removeSurfaceButton}
          title="Remove this surface"
          aria-label="Remove surface"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  );
}