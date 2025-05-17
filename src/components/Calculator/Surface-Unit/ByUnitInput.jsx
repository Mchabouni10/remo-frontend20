//src/components/Calculator/Surface-Unit/ByUnitInput.jsx
import React from 'react';
import styles from './ByUnitInput.module.css';

export default function ByUnitInput({
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
                  const updated = { ...surf, measurementType: 'by-unit' };
                  if (field === 'units') {
                    updated.units = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                    updated.sqft = updated.units || 0;
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
          value="By Unit"
          className={styles.input}
          disabled
          title="Measurement type"
          aria-label="Measurement type"
        />
      </div>
      <div className={styles.inputWrapper}>
        <i className={`fas fa-boxes ${styles.inputIcon}`}></i>
        <input
          type="number"
          placeholder="Units"
          value={surface.units || ''}
          onChange={(e) => updateSurface('units', e.target.value)}
          className={styles.input}
          min="0"
          step="1"
          disabled={disabled}
          title="Enter the number of units"
          aria-label="Units"
        />
      </div>
      <span className={styles.sqft}>
        <i className={`fas fa-square-full ${styles.sqftIcon}`}></i>
        {(parseFloat(surface.sqft) || 0).toFixed(2)} units
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