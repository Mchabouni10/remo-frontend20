// src/components/Calculator/SurfaceInput.jsx
import React from 'react';
import styles from './Calculator.module.css';

export default function SurfaceInput({ catIndex, workIndex, surfIndex, surface, setCategories, showRemove, disabled = false }) {
  const updateSurface = (field, value) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf };
                  if (field === 'width' || field === 'height') {
                    updated[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                    const width = updated.width || 0;
                    const height = updated.height || 0;
                    updated.sqft = !surf.manualSqft ? width * height : surf.sqft;
                  } else if (field === 'sqft' && surf.manualSqft) {
                    updated.sqft = Math.max(0, parseFloat(value) || 0);
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

  const toggleManualSqft = () => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) =>
                k === surfIndex ? { ...surf, manualSqft: !surf.manualSqft, width: '', height: '' } : surf
              );
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
      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          checked={surface.manualSqft}
          onChange={toggleManualSqft}
          disabled={disabled}
        />
        Manual
      </label>
      {surface.manualSqft ? (
        <input
          type="number"
          placeholder="Square Feet"
          value={surface.sqft}
          onChange={(e) => updateSurface('sqft', e.target.value)}
          className={styles.input}
          min="0"
          disabled={disabled} // Only disabled if parent is disabled, not tied to manualSqft
        />
      ) : (
        <>
          <input
            type="number"
            placeholder="Width (ft)"
            value={surface.width}
            onChange={(e) => updateSurface('width', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
          <input
            type="number"
            placeholder="Height (ft)"
            value={surface.height}
            onChange={(e) => updateSurface('height', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </>
      )}
      <span className={styles.sqft}>Sqft: {(parseFloat(surface.sqft) || 0).toFixed(2)}</span>
      {showRemove && !disabled && (
        <button onClick={removeSurface} className={styles.removeSurfaceButton}>
          ×
        </button>
      )}
    </div>
  );
}