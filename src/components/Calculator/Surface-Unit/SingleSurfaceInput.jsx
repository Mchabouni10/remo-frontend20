//src/components/Calculator/Surface-Unit/SingleSurfaceInput.jsx
import React, { useCallback, useRef, useState } from 'react';
import styles from './SingleSurfaceInput.module.css';

export default function SingleSurfaceInput({
  catIndex,
  workIndex,
  surfIndex,
  surface,
  setCategories,
  showRemove,
  disabled = false,
}) {
  const [errors, setErrors] = useState({});
  const inputTimeoutRef = useRef(null);

  const calculateSqft = useCallback((width, height) => {
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    const sqft = w * h;

    const newErrors = {};
    if (w <= 0 && width !== '') newErrors.width = 'Width must be greater than 0';
    if (h <= 0 && height !== '') newErrors.height = 'Height must be greater than 0';
    setErrors(newErrors);

    return sqft;
  }, []);

  const toggleManualSqft = useCallback(() => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) =>
                k === surfIndex
                  ? { ...surf, manualSqft: !surf.manualSqft, width: '', height: '', sqft: 0 }
                  : surf
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
    setErrors({});
  }, [disabled, catIndex, workIndex, surfIndex, setCategories]);

  const updateSurface = useCallback((field, value) => {
    if (disabled) return;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      setCategories((prevCategories) =>
        prevCategories.map((cat, i) => {
          if (i === catIndex) {
            const updatedWorkItems = cat.workItems.map((item, j) => {
              if (j === workIndex) {
                const updatedSurfaces = item.surfaces.map((surf, k) => {
                  if (k === surfIndex) {
                    const updated = { ...surf, measurementType: 'single-surface', manualSqft: surf.manualSqft || false };
                    if (['width', 'height'].includes(field)) {
                      updated[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                      if (!updated.manualSqft) {
                        updated.sqft = calculateSqft(
                          field === 'width' ? value : updated.width,
                          field === 'height' ? value : updated.height
                        );
                      }
                    } else if (field === 'sqft' && updated.manualSqft) {
                      const sqft = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                      updated.sqft = sqft;
                      const newErrors = {};
                      if (sqft <= 0 && value !== '') newErrors.sqft = 'Square footage must be greater than 0';
                      setErrors(newErrors);
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
    }, 50);
  }, [disabled, catIndex, workIndex, surfIndex, setCategories, calculateSqft]);

  const removeSurface = useCallback(() => {
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
    setErrors({});
  }, [disabled, catIndex, workIndex, surfIndex, setCategories]);

  return (
    <div className={styles.surfaceRow}>
      <div className="input-wrapper">
        <i className={`fas fa-square input-icon`}></i>
        <input
          type="text"
          value="Surface Area"
          className="input"
          disabled
          title="Measurement type: Surface Area in square feet"
          aria-label="Measurement type: Surface Area"
        />
      </div>
      <label className={styles.toggleLabel} title="Toggle manual square footage input">
        <input
          type="checkbox"
          checked={surface.manualSqft || false}
          onChange={toggleManualSqft}
          disabled={disabled}
          aria-label="Toggle manual square footage input"
        />
        <i className={`fas ${surface.manualSqft ? 'fa-ruler' : 'fa-calculator'} icon`}></i>
        <span>Manual</span>
      </label>
      {surface.manualSqft ? (
        <div className="input-wrapper">
          <i className={`fas fa-square input-icon`}></i>
          <input
            type="number"
            placeholder="Square Feet"
            value={surface.sqft || ''}
            onChange={(e) => updateSurface('sqft', e.target.value)}
            className={`input ${errors.sqft ? 'input--error' : ''}`}
            min="0"
            step="0.1"
            disabled={disabled}
            title="Enter the total square footage manually"
            aria-label="Manual square footage in square feet"
          />
          {errors.sqft && <span className="error-message">{errors.sqft}</span>}
        </div>
      ) : (
        <>
          <div className="input-wrapper">
            <i className={`fas fa-arrows-alt-h input-icon`}></i>
            <input
              type="number"
              placeholder="Width (ft)"
              value={surface.width || ''}
              onChange={(e) => updateSurface('width', e.target.value)}
              className={`input ${errors.width ? 'input--error' : ''}`}
              min="0"
              step="0.1"
              disabled={disabled}
              title="Enter the surface width in feet"
              aria-label="Surface width in feet"
            />
            {errors.width && <span className="error-message">{errors.width}</span>}
          </div>
          <div className="input-wrapper">
            <i className={`fas fa-arrows-alt-v input-icon`}></i>
            <input
              type="number"
              placeholder="Height (ft)"
              value={surface.height || ''}
              onChange={(e) => updateSurface('height', e.target.value)}
              className={`input ${errors.height ? 'input--error' : ''}`}
              min="0"
              step="0.1"
              disabled={disabled}
              title="Enter the surface height in feet"
              aria-label="Surface height in feet"
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
          </div>
        </>
      )}
      <span className="units">
        <i className={`fas fa-square units-icon`}></i>
        {(parseFloat(surface.sqft) || 0).toFixed(2)} sqft
      </span>
      {showRemove && !disabled && (
        <button
          onClick={removeSurface}
          className="button button--error"
          title="Remove this surface area"
          aria-label="Remove surface area"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  );
}