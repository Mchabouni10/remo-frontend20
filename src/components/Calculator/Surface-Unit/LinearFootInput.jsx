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
      <div className="input-wrapper">
        <i className={`fas fa-ruler-combined input-icon`}></i>
        <input
          type="text"
          value="Linear Foot"
          className="input"
          disabled
          title="Measurement type: Linear Foot"
          aria-label="Measurement type: Linear Foot"
        />
      </div>
      <div className="input-wrapper">
        <i className={`fas fa-ruler-horizontal input-icon`}></i>
        <input
          type="number"
          placeholder="Linear Feet"
          value={surface.linearFt || ''}
          onChange={(e) => updateSurface('linearFt', e.target.value)}
          className="input"
          min="0"
          step="0.1"
          disabled={disabled}
          title="Enter the total linear feet"
          aria-label="Linear feet"
        />
      </div>
      <span className="units">
        <i className={`fas fa-ruler units-icon`}></i>
        {(parseFloat(surface.linearFt) || 0).toFixed(2)} ft
      </span>
      {showRemove && !disabled && (
        <button
          onClick={removeSurface}
          className="button button--error"
          title="Remove this surface"
          aria-label="Remove surface"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  );
}