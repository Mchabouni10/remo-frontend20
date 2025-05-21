//src/components/Calculator/Surface-Unit/RoomSurfaceInput.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './RoomSurfaceInput.module.css';

export default function RoomSurfaceInput({
  catIndex,
  workIndex,
  surfIndex,
  surface,
  setCategories,
  showRemove,
  disabled = false,
}) {
  const [roomShape, setRoomShape] = useState(surface.roomShape || 'rectangular');
  const [lastAddedExclusion, setLastAddedExclusion] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [errors, setErrors] = useState({});
  const inputTimeoutRef = useRef(null);

  const DOOR_SIZES = [
    { label: '3x7 ft (Standard)', value: '3x7', width: 3, height: 7, area: 21 },
    { label: '3x8 ft', value: '3x8', width: 3, height: 8, area: 24 },
    { label: '6x7 ft (Double)', value: '6x7', width: 6, height: 7, area: 42 },
    { label: 'Custom', value: 'custom', width: 0, height: 0, area: 0 },
  ];
  const WINDOW_SIZES = [
    { label: '3x4 ft (Standard)', value: '3x4', width: 3, height: 4, area: 12 },
    { label: '4x4 ft', value: '4x4', width: 4, height: 4, area: 16 },
    { label: '2x3 ft (Small)', value: '2x3', width: 2, height: 3, area: 6 },
    { label: 'Custom', value: 'custom', width: 0, height: 0, area: 0 },
  ];
  const CLOSET_SIZES = [
    { label: '4x7 ft (Standard)', value: '4x7', width: 4, height: 7, area: 28 },
    { label: '6x7 ft (Wide)', value: '6x7', width: 6, height: 7, area: 42 },
    { label: '2x7 ft (Narrow)', value: '2x7', width: 2, height: 7, area: 14 },
    { label: 'Custom', value: 'custom', width: 0, height: 0, area: 0 },
  ];

  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const calculateSqft = useCallback((surfaceData) => {
    const length = parseFloat(surfaceData.length) || 0;
    const width = surfaceData.roomShape === 'square' ? length : parseFloat(surfaceData.width) || 0;
    const height = surfaceData.roomHeight === 'custom' ? (parseFloat(surfaceData.customHeight) || 8) : parseFloat(surfaceData.roomHeight || 8);
    const perimeter = surfaceData.roomShape === 'square' ? 4 * length : 2 * (length + width);
    const wallArea = perimeter * height;
    const ceilingArea = length * width;
    const exclusions =
      (surfaceData.doors || []).reduce((sum, d) => sum + (parseFloat(d.area) || 0), 0) +
      (surfaceData.windows || []).reduce((sum, w) => sum + (parseFloat(w.area) || 0), 0) +
      (surfaceData.closets || []).reduce((sum, c) => sum + (parseFloat(c.area) || 0), 0);
    const sqft = Math.max(0, wallArea + ceilingArea - exclusions);

    // Validate inputs
    const newErrors = {};
    if (length <= 0) newErrors.length = 'Length must be greater than 0';
    if (surfaceData.roomShape === 'rectangular' && width <= 0) newErrors.width = 'Width must be greater than 0';
    if (height <= 0) newErrors.height = 'Height must be greater than 0';
    if (sqft === 0 && (wallArea + ceilingArea > 0)) newErrors.exclusions = 'Exclusions exceed room area';
    setErrors(newErrors);

    return sqft;
  }, []);

  const updateSurface = useCallback((field, value, index = null, exclusionType = null) => {
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
                    const updated = { ...surf, measurementType: 'room-surface' };
                    if (['length', 'width', 'customHeight'].includes(field)) {
                      updated[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                    } else if (exclusionType && index !== null) {
                      const exclusions = updated[exclusionType] || [];
                      exclusions[index] = { ...exclusions[index], [field]: value };
                      if (field === 'size' && value !== 'custom') {
                        const sizeData = (
                          exclusionType === 'doors' ? DOOR_SIZES :
                          exclusionType === 'windows' ? WINDOW_SIZES :
                          CLOSET_SIZES
                        ).find(s => s.value === value);
                        exclusions[index].width = sizeData.width;
                        exclusions[index].height = sizeData.height;
                        exclusions[index].area = sizeData.area;
                      } else if (field === 'width' || field === 'height') {
                        const width = parseFloat(exclusions[index].width) || 0;
                        const height = parseFloat(exclusions[index].height) || 0;
                        exclusions[index].area = width * height;
                      }
                      updated[exclusionType] = exclusions;
                    } else {
                      updated[field] = value;
                    }
                    updated.sqft = calculateSqft(updated);
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

  const addExclusion = useCallback((type) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf };
                  const defaultSize = type === 'doors' ? '3x7' : type === 'windows' ? '3x4' : '4x7';
                  const sizeData = (
                    type === 'doors' ? DOOR_SIZES :
                    type === 'windows' ? WINDOW_SIZES :
                    CLOSET_SIZES
                  ).find(s => s.value === defaultSize);
                  const newExclusion = { size: defaultSize, width: sizeData.width, height: sizeData.height, area: sizeData.area };
                  updated[type] = [...(updated[type] || []), newExclusion];
                  setLastAddedExclusion({ type, index: updated[type].length - 1 });
                  setShowUndo(true);
                  updated.sqft = calculateSqft(updated);
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
  }, [disabled, catIndex, workIndex, surfIndex, setCategories, calculateSqft]);

  const removeExclusion = useCallback((type, index) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf };
                  updated[type] = updated[type] ? updated[type].filter((_, idx) => idx !== index) : [];
                  updated.sqft = calculateSqft(updated);
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
    setShowUndo(false);
  }, [disabled, catIndex, workIndex, surfIndex, setCategories, calculateSqft]);

  const undoAddExclusion = useCallback(() => {
    if (disabled || !lastAddedExclusion) return;
    removeExclusion(lastAddedExclusion.type, lastAddedExclusion.index);
    setLastAddedExclusion(null);
    setShowUndo(false);
  }, [disabled, lastAddedExclusion, removeExclusion]);

  const handleRoomShapeChange = useCallback((shape) => {
    if (disabled) return;
    setRoomShape(shape);
    updateSurface('roomShape', shape);
    if (shape === 'square') {
      updateSurface('width', '');
    }
  }, [disabled, updateSurface]);

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
  }, [disabled, catIndex, workIndex, surfIndex, setCategories]);

  return (
    <div className={styles.surfaceRow}>
      <div className={styles.inputWrapper}>
        <i className={`fas fa-home ${styles.inputIcon}`}></i>
        <input
          type="text"
          value="Room Area"
          className={styles.input}
          disabled
          title="Measurement type: Room Area in square feet"
          aria-label="Measurement type: Room Area"
        />
      </div>
      <div className={styles.roomPaintingContainer}>
        <div className={styles.inputGroup}>
          <span className={styles.groupLabel}>Room Dimensions</span>
          <div className={styles.inputWrapper}>
            <i className={`fas fa-shapes ${styles.inputIcon}`}></i>
            <select
              value={roomShape}
              onChange={(e) => handleRoomShapeChange(e.target.value)}
              className={`${styles.input} ${errors.roomShape ? styles.error : ''}`}
              disabled={disabled}
              title="Select the room's floor plan shape"
              aria-label="Room shape selection"
            >
              <option value="rectangular">Rectangular Room</option>
              <option value="square">Square Room</option>
            </select>
          </div>
          <div className={styles.inputWrapper}>
            <i className={`fas fa-ruler-horizontal ${styles.inputIcon}`}></i>
            <input
              type="number"
              placeholder={roomShape === 'square' ? 'Side Length (ft)' : 'Room Length (ft)'}
              value={surface.length || ''}
              onChange={(e) => updateSurface('length', e.target.value)}
              className={`${styles.input} ${errors.length ? styles.error : ''}`}
              min="0"
              step="0.1"
              disabled={disabled}
              title="Enter the room's length or side length in feet (e.g., 12)"
              aria-label="Room length in feet"
            />
            {errors.length && <span className={styles.errorMessage}>{errors.length}</span>}
          </div>
          {roomShape === 'rectangular' && (
            <div className={styles.inputWrapper}>
              <i className={`fas fa-ruler-horizontal ${styles.inputIcon}`}></i>
              <input
                type="number"
                placeholder="Room Width (ft)"
                value={surface.width || ''}
                onChange={(e) => updateSurface('width', e.target.value)}
                className={`${styles.input} ${errors.width ? styles.error : ''}`}
                min="0"
                step="0.1"
                disabled={disabled}
                title="Enter the room's width in feet (e.g., 10)"
                aria-label="Room width in feet"
              />
              {errors.width && <span className={styles.errorMessage}>{errors.width}</span>}
            </div>
          )}
          <div className={styles.inputWrapper}>
            <i className={`fas fa-ruler-vertical ${styles.inputIcon}`}></i>
            <select
              value={surface.roomHeight || '8'}
              onChange={(e) => updateSurface('roomHeight', e.target.value)}
              className={`${styles.input} ${errors.height ? styles.error : ''}`}
              disabled={disabled}
              title="Select the room's ceiling height"
              aria-label="Room height selection"
            >
              <option value="8">8 ft (Standard)</option>
              <option value="10">10 ft</option>
              <option value="custom">Custom Height</option>
            </select>
          </div>
          {surface.roomHeight === 'custom' && (
            <div className={styles.inputWrapper}>
              <i className={`fas fa-ruler-vertical ${styles.inputIcon}`}></i>
              <input
                type="number"
                placeholder="Custom Height (ft)"
                value={surface.customHeight || ''}
                onChange={(e) => updateSurface('customHeight', e.target.value)}
                className={`${styles.input} ${errors.height ? styles.error : ''}`}
                min="0"
                step="0.1"
                disabled={disabled}
                title="Enter a custom ceiling height in feet (e.g., 9)"
                aria-label="Custom room height in feet"
              />
              {errors.height && <span className={styles.errorMessage}>{errors.height}</span>}
            </div>
          )}
        </div>
        <div className={styles.inputGroup}>
          <span className={styles.groupLabel}>Exclusions (Non-Painted Areas)</span>
          {errors.exclusions && <span className={styles.errorMessage}>{errors.exclusions}</span>}
          {showUndo && lastAddedExclusion && (
            <button
              onClick={undoAddExclusion}
              className={styles.undoButton}
              title={`Undo adding ${lastAddedExclusion.type.slice(0, -1)}`}
              aria-label={`Undo adding ${lastAddedExclusion.type.slice(0, -1)} exclusion`}
            >
              <i className="fas fa-undo"></i> Undo Add {lastAddedExclusion.type.slice(0, -1)}
            </button>
          )}
          {(surface.doors || []).map((door, idx) => (
            <div key={`door-${idx}`} className={styles.exclusionRow}>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-door-closed ${styles.inputIcon}`}></i>
                <select
                  value={door.size || '3x7'}
                  onChange={(e) => updateSurface('size', e.target.value, idx, 'doors')}
                  className={styles.input}
                  disabled={disabled}
                  title="Select door size or choose Custom"
                  aria-label={`Door ${idx + 1} size selection`}
                >
                  {DOOR_SIZES.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              {door.size === 'custom' && (
                <>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-h ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Width (ft)"
                      value={door.width || ''}
                      onChange={(e) => updateSurface('width', e.target.value, idx, 'doors')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom door width in feet (e.g., 3)"
                      aria-label={`Door ${idx + 1} custom width in feet`}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-v ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Height (ft)"
                      value={door.height || ''}
                      onChange={(e) => updateSurface('height', e.target.value, idx, 'doors')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom door height in feet (e.g., 7)"
                      aria-label={`Door ${idx + 1} custom height in feet`}
                    />
                  </div>
                </>
              )}
              {!disabled && (
                <button
                  onClick={() => removeExclusion('doors', idx)}
                  className={styles.removeExclusionButton}
                  title="Remove this door"
                  aria-label={`Remove door ${idx + 1} exclusion`}
                >
                  <i className="fas fa-minus-circle"></i>
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <button
              onClick={() => addExclusion('doors')}
              className={styles.addExclusionButton}
              title="Add another door"
              aria-label="Add door exclusion"
              disabled={errors.length || (roomShape === 'rectangular' && errors.width)}
            >
              <i className="fas fa-plus"></i> Add Door
            </button>
          )}
          {(surface.windows || []).map((window, idx) => (
            <div key={`window-${idx}`} className={styles.exclusionRow}>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-window-maximize ${styles.inputIcon}`}></i>
                <select
                  value={window.size || '3x4'}
                  onChange={(e) => updateSurface('size', e.target.value, idx, 'windows')}
                  className={styles.input}
                  disabled={disabled}
                  title="Select window size or choose Custom"
                  aria-label={`Window ${idx + 1} size selection`}
                >
                  {WINDOW_SIZES.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              {window.size === 'custom' && (
                <>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-h ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Width (ft)"
                      value={window.width || ''}
                      onChange={(e) => updateSurface('width', e.target.value, idx, 'windows')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom window width in feet (e.g., 3)"
                      aria-label={`Window ${idx + 1} custom width in feet`}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-v ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Height (ft)"
                      value={window.height || ''}
                      onChange={(e) => updateSurface('height', e.target.value, idx, 'windows')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom window height in feet (e.g., 4)"
                      aria-label={`Window ${idx + 1} custom height in feet`}
                    />
                  </div>
                </>
              )}
              {!disabled && (
                <button
                  onClick={() => removeExclusion('windows', idx)}
                  className={styles.removeExclusionButton}
                  title="Remove this window"
                  aria-label={`Remove window ${idx + 1} exclusion`}
                >
                  <i className="fas fa-minus-circle"></i>
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <button
              onClick={() => addExclusion('windows')}
              className={styles.addExclusionButton}
              title="Add another window"
              aria-label="Add window exclusion"
              disabled={errors.length || (roomShape === 'rectangular' && errors.width)}
            >
              <i className="fas fa-plus"></i> Add Window
            </button>
          )}
          {(surface.closets || []).map((closet, idx) => (
            <div key={`closet-${idx}`} className={styles.exclusionRow}>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-warehouse ${styles.inputIcon}`}></i>
                <select
                  value={closet.size || '4x7'}
                  onChange={(e) => updateSurface('size', e.target.value, idx, 'closets')}
                  className={styles.input}
                  disabled={disabled}
                  title="Select closet opening size or choose Custom"
                  aria-label={`Closet ${idx + 1} size selection`}
                >
                  {CLOSET_SIZES.map(size => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>
              {closet.size === 'custom' && (
                <>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-h ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Width (ft)"
                      value={closet.width || ''}
                      onChange={(e) => updateSurface('width', e.target.value, idx, 'closets')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom closet opening width in feet (e.g., 4)"
                      aria-label={`Closet ${idx + 1} custom width in feet`}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-arrows-alt-v ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      placeholder="Height (ft)"
                      value={closet.height || ''}
                      onChange={(e) => updateSurface('height', e.target.value, idx, 'closets')}
                      className={styles.input}
                      min="0"
                      step="0.1"
                      disabled={disabled}
                      title="Enter custom closet opening height in feet (e.g., 7)"
                      aria-label={`Closet ${idx + 1} custom height in feet`}
                    />
                  </div>
                </>
              )}
              {!disabled && (
                <button
                  onClick={() => removeExclusion('closets', idx)}
                  className={styles.removeExclusionButton}
                  title="Remove this closet opening"
                  aria-label={`Remove closet ${idx + 1} exclusion`}
                >
                  <i className="fas fa-minus-circle"></i>
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <button
              onClick={() => addExclusion('closets')}
              className={styles.addExclusionButton}
              title="Add another closet opening"
              aria-label="Add closet exclusion"
              disabled={errors.length || (roomShape === 'rectangular' && errors.width)}
            >
              <i className="fas fa-plus"></i> Add Closet
            </button>
          )}
        </div>
      </div>
      <span className={styles.units} aria-live="polite">
        <i className={`fas fa-home ${styles.unitsIcon}`}></i>
        {(parseFloat(surface.sqft) || 0).toFixed(2)} sqft
      </span>
      {showRemove && !disabled && (
        <button
          onClick={removeSurface}
          className={styles.removeSurfaceButton}
          title="Remove this room area"
          aria-label="Remove room area"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      )}
    </div>
  );
}