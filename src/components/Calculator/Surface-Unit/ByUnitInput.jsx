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
          value="By Unit"
          className="input"
          disabled
          title="Measurement type: By Unit"
          aria-label="Measurement type: By Unit"
        />
      </div>
      <div className="input-wrapper">
        <i className={`fas fa-boxes input-icon`}></i>
        <input
          type="number"
          placeholder="Units"
          value={surface.units || ''}
          onChange={(e) => updateSurface('units', e.target.value)}
          className="input"
          min="0"
          step="1"
          disabled={disabled}
          title="Enter the number of units"
          aria-label="Units"
        />
      </div>
      <span className="units">
        <i className={`fas fa-box units-icon`}></i>
        {(parseFloat(surface.units) || 0).toFixed(0)} units
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