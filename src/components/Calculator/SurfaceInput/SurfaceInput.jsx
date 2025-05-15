//src/components/Calculator/SurfaceInput/SurfaceInput.jsx

import React, { useState, useEffect } from 'react';
import styles from './SurfaceInput.module.css';

export default function SurfaceInput({
  catIndex,
  workIndex,
  surfIndex,
  surface,
  setCategories,
  showRemove,
  disabled = false,
}) {
  const [measurementType, setMeasurementType] = useState(surface.measurementType || 'single-surface');
  const [roomShape, setRoomShape] = useState(surface.roomShape || 'rectangular');
  const [lastAddedExclusion, setLastAddedExclusion] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  // Predefined sizes for doors, windows, closets
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

  // Hide undo button after 5 seconds
  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const updateSurface = (field, value, index = null, exclusionType = null) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf, measurementType: surf.measurementType || 'single-surface' };
                  if (['width', 'height', 'length', 'customHeight', 'linearFt', 'units'].includes(field)) {
                    updated[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
                    if (field === 'width' || field === 'height') {
                      if (!surf.manualSqft && updated.measurementType === 'single-surface') {
                        const width = updated.width || 0;
                        const height = updated.height || 0;
                        updated.sqft = width * height;
                      }
                    } else if (field === 'linearFt' && updated.measurementType === 'linear-foot') {
                      updated.sqft = updated.linearFt || 0;
                    } else if (field === 'units' && updated.measurementType === 'by-unit') {
                      updated.sqft = updated.units || 0;
                    }
                  } else if (field === 'sqft' && surf.manualSqft) {
                    updated.sqft = Math.max(0, parseFloat(value) || 0);
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
                  // Calculate room painting area if in room-surface mode
                  if (updated.measurementType === 'room-surface') {
                    const length = updated.length || 0;
                    const width = updated.roomShape === 'square' ? length : updated.width || 0;
                    const height = updated.roomHeight === 'custom' ? (updated.customHeight || 8) : parseFloat(updated.roomHeight || 8);
                    const perimeter = updated.roomShape === 'square' ? 4 * length : 2 * (length + width);
                    const wallArea = perimeter * height;
                    const ceilingArea = length * width;
                    const exclusions =
                      (updated.doors || []).reduce((sum, d) => sum + (d.area || 0), 0) +
                      (updated.windows || []).reduce((sum, w) => sum + (w.area || 0), 0) +
                      (updated.closets || []).reduce((sum, c) => sum + (c.area || 0), 0);
                    updated.sqft = Math.max(0, wallArea + ceilingArea - exclusions);
                    if (exclusions > wallArea + ceilingArea) {
                      console.warn('Exclusions exceed total surface area, setting sqft to 0');
                    }
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

  const addExclusion = (type) => {
    if (disabled || measurementType !== 'room-surface') return;
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
                  const length = updated.length || 0;
                  const width = updated.roomShape === 'square' ? length : updated.width || 0;
                  const height = updated.roomHeight === 'custom' ? (updated.customHeight || 8) : parseFloat(updated.roomHeight || 8);
                  const perimeter = updated.roomShape === 'square' ? 4 * length : 2 * (length + width);
                  const wallArea = perimeter * height;
                  const ceilingArea = length * width;
                  const exclusions =
                    (updated.doors || []).reduce((sum, d) => sum + (d.area || 0), 0) +
                    (updated.windows || []).reduce((sum, w) => sum + (w.area || 0), 0) +
                    (updated.closets || []).reduce((sum, c) => sum + (c.area || 0), 0);
                  updated.sqft = Math.max(0, wallArea + ceilingArea - exclusions);
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

  const removeExclusion = (type, index) => {
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
                  if (updated.measurementType === 'room-surface') {
                    const length = updated.length || 0;
                    const width = updated.roomShape === 'square' ? length : updated.width || 0;
                    const height = updated.roomHeight === 'custom' ? (updated.customHeight || 8) : parseFloat(updated.roomHeight || 8);
                    const perimeter = updated.roomShape === 'square' ? 4 * length : 2 * (length + width);
                    const wallArea = perimeter * height;
                    const ceilingArea = length * width;
                    const exclusions =
                      (updated.doors || []).reduce((sum, d) => sum + (d.area || 0), 0) +
                      (updated.windows || []).reduce((sum, w) => sum + (w.area || 0), 0) +
                      (updated.closets || []).reduce((sum, c) => sum + (c.area || 0), 0);
                    updated.sqft = Math.max(0, wallArea + ceilingArea - exclusions);
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
    setShowUndo(false);
  };

  const undoAddExclusion = () => {
    if (disabled || !lastAddedExclusion) return;
    removeExclusion(lastAddedExclusion.type, lastAddedExclusion.index);
    setLastAddedExclusion(null);
    setShowUndo(false);
  };

  const toggleManualSqft = () => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) =>
                k === surfIndex
                  ? { ...surf, manualSqft: !surf.manualSqft, width: '', height: '' }
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
  };

  const handleMeasurementTypeChange = (type) => {
    if (disabled) return;
    setMeasurementType(type);
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updatedSurfaces = item.surfaces.map((surf, k) => {
                if (k === surfIndex) {
                  const updated = { ...surf, measurementType: type };
                  if (type === 'single-surface') {
                    updated.width = surf.width || '10';
                    updated.height = surf.height || '10';
                    updated.sqft = !surf.manualSqft ? (parseFloat(updated.width) * parseFloat(updated.height)) || 100 : surf.sqft || 100;
                    updated.manualSqft = surf.manualSqft || false;
                    updated.length = '';
                    updated.roomShape = undefined;
                    updated.roomHeight = undefined;
                    updated.customHeight = undefined;
                    updated.doors = [];
                    updated.windows = [];
                    updated.closets = [];
                    updated.linearFt = '';
                    updated.units = '';
                  } else if (type === 'room-surface') {
                    updated.length = surf.length || '12';
                    updated.width = roomShape === 'rectangular' ? (surf.width || '10') : '';
                    updated.roomShape = roomShape;
                    updated.roomHeight = surf.roomHeight || '8';
                    updated.customHeight = surf.customHeight || '';
                    updated.doors = surf.doors || [{ size: '3x7', width: 3, height: 7, area: 21 }];
                    updated.windows = surf.windows || [{ size: '3x4', width: 3, height: 4, area: 12 }];
                    updated.closets = surf.closets || [{ size: '4x7', width: 4, height: 7, area: 28 }];
                    updated.manualSqft = false;
                    updated.linearFt = '';
                    updated.units = '';
                    const length = parseFloat(updated.length) || 0;
                    const width = updated.roomShape === 'square' ? length : parseFloat(updated.width) || 0;
                    const height = updated.roomHeight === 'custom' ? (parseFloat(updated.customHeight) || 8) : parseFloat(updated.roomHeight || 8);
                    const perimeter = updated.roomShape === 'square' ? 4 * length : 2 * (length + width);
                    const wallArea = perimeter * height;
                    const ceilingArea = length * width;
                    const exclusions =
                      (updated.doors || []).reduce((sum, d) => sum + (d.area || 0), 0) +
                      (updated.windows || []).reduce((sum, w) => sum + (w.area || 0), 0) +
                      (updated.closets || []).reduce((sum, c) => sum + (c.area || 0), 0);
                    updated.sqft = Math.max(0, wallArea + ceilingArea - exclusions);
                  } else if (type === 'linear-foot') {
                    updated.linearFt = surf.linearFt || '10';
                    updated.sqft = parseFloat(updated.linearFt) || 10;
                    updated.width = '';
                    updated.height = '';
                    updated.manualSqft = false;
                    updated.length = '';
                    updated.roomShape = undefined;
                    updated.roomHeight = undefined;
                    updated.customHeight = undefined;
                    updated.doors = [];
                    updated.windows = [];
                    updated.closets = [];
                    updated.units = '';
                  } else if (type === 'by-unit') {
                    updated.units = surf.units || '1';
                    updated.sqft = parseFloat(updated.units) || 1;
                    updated.width = '';
                    updated.height = '';
                    updated.manualSqft = false;
                    updated.length = '';
                    updated.roomShape = undefined;
                    updated.roomHeight = undefined;
                    updated.customHeight = undefined;
                    updated.doors = [];
                    updated.windows = [];
                    updated.closets = [];
                    updated.linearFt = '';
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

  const handleRoomShapeChange = (shape) => {
    if (disabled) return;
    setRoomShape(shape);
    updateSurface('roomShape', shape);
    if (shape === 'square') {
      updateSurface('width', '');
    }
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
        <select
          value={measurementType}
          onChange={(e) => handleMeasurementTypeChange(e.target.value)}
          className={styles.input}
          disabled={disabled}
          title="Select measurement type"
          aria-label="Measurement type"
        >
          <option value="single-surface">Single Surface</option>
          <option value="room-surface">Room Surface</option>
          <option value="linear-foot">Linear Foot</option>
          <option value="by-unit">By Unit</option>
        </select>
      </div>

      {measurementType === 'room-surface' ? (
        <div className={styles.roomPaintingContainer}>
          <div className={styles.inputGroup}>
            <span className={styles.groupLabel}>Room Dimensions</span>
            <div className={styles.inputWrapper}>
              <i className={`fas fa-shapes ${styles.inputIcon}`}></i>
              <select
                value={roomShape}
                onChange={(e) => handleRoomShapeChange(e.target.value)}
                className={styles.input}
                disabled={disabled}
                title="Select the room's floor plan shape"
                aria-label="Room shape"
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
                className={styles.input}
                min="0"
                step="0.1"
                disabled={disabled}
                title="Enter the room's length or side length in feet (e.g., 12)"
                aria-label="Room length"
              />
            </div>
            {roomShape === 'rectangular' && (
              <div className={styles.inputWrapper}>
                <i className={`fas fa-ruler-horizontal ${styles.inputIcon}`}></i>
                <input
                  type="number"
                  placeholder="Room Width (ft)"
                  value={surface.width || ''}
                  onChange={(e) => updateSurface('width', e.target.value)}
                  className={styles.input}
                  min="0"
                  step="0.1"
                  disabled={disabled}
                  title="Enter the room's width in feet (e.g., 10)"
                  aria-label="Room width"
                />
              </div>
            )}
            <div className={styles.inputWrapper}>
              <i className={`fas fa-ruler-vertical ${styles.inputIcon}`}></i>
              <select
                value={surface.roomHeight || '8'}
                onChange={(e) => updateSurface('roomHeight', e.target.value)}
                className={styles.input}
                disabled={disabled}
                title="Select the room's ceiling height"
                aria-label="Room height"
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
                  className={styles.input}
                  min="0"
                  step="0.1"
                  disabled={disabled}
                  title="Enter a custom ceiling height in feet (e.g., 9)"
                  aria-label="Custom room height"
                />
              </div>
            )}
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.groupLabel}>Exclusions (Non-Painted Areas)</span>
            {showUndo && lastAddedExclusion && (
              <button
                onClick={undoAddExclusion}
                className={styles.undoButton}
                title={`Undo adding ${lastAddedExclusion.type.slice(0, -1)}`}
                aria-label={`Undo adding ${lastAddedExclusion.type.slice(0, -1)}`}
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
                    aria-label={`Door ${idx + 1} size`}
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
                        aria-label={`Door ${idx + 1} custom width`}
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
                        aria-label={`Door ${idx + 1} custom height`}
                      />
                    </div>
                  </>
                )}
                {!disabled && (
                  <button
                    onClick={() => removeExclusion('doors', idx)}
                    className={styles.removeExclusionButton}
                    title="Remove this door"
                    aria-label={`Remove door ${idx + 1}`}
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
                aria-label="Add door"
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
                    aria-label={`Window ${idx + 1} size`}
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
                        aria-label={`Window ${idx + 1} custom width`}
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
                        aria-label={`Window ${idx + 1} custom height`}
                      />
                    </div>
                  </>
                )}
                {!disabled && (
                  <button
                    onClick={() => removeExclusion('windows', idx)}
                    className={styles.removeExclusionButton}
                    title="Remove this window"
                    aria-label={`Remove window ${idx + 1}`}
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
                aria-label="Add window"
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
                    aria-label={`Closet ${idx + 1} size`}
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
                        aria-label={`Closet ${idx + 1} custom width`}
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
                        aria-label={`Closet ${idx + 1} custom height`}
                      />
                    </div>
                  </>
                )}
                {!disabled && (
                  <button
                    onClick={() => removeExclusion('closets', idx)}
                    className={styles.removeExclusionButton}
                    title="Remove this closet opening"
                    aria-label={`Remove closet ${idx + 1}`}
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
                aria-label="Add closet"
              >
                <i className="fas fa-plus"></i> Add Closet
              </button>
            )}
          </div>
        </div>
      ) : measurementType === 'single-surface' ? (
        <>
          <label className={styles.toggleLabel} title="Toggle manual square footage input">
            <input
              type="checkbox"
              checked={surface.manualSqft || false}
              onChange={toggleManualSqft}
              disabled={disabled}
              aria-label="Toggle manual square footage"
            />
            <i className={`fas ${surface.manualSqft ? 'fa-ruler' : 'fa-calculator'} ${styles.icon}`}></i>
            <span>Manual</span>
          </label>
          {surface.manualSqft ? (
            <div className={styles.inputWrapper}>
              <i className={`fas fa-ruler-combined ${styles.inputIcon}`}></i>
              <input
                type="number"
                placeholder="Square Feet"
                value={surface.sqft || ''}
                onChange={(e) => updateSurface('sqft', e.target.value)}
                className={styles.input}
                min="0"
                step="0.1"
                disabled={disabled}
                title="Enter the total square footage manually"
                aria-label="Manual square footage"
              />
            </div>
          ) : (
            <>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-arrows-alt-h ${styles.inputIcon}`}></i>
                <input
                  type="number"
                  placeholder="Width (ft)"
                  value={surface.width || ''}
                  onChange={(e) => updateSurface('width', e.target.value)}
                  className={styles.input}
                  min="0"
                  step="0.1"
                  disabled={disabled}
                  title="Enter the surface width in feet"
                  aria-label="Surface width"
                />
              </div>
              <div className={styles.inputWrapper}>
                <i className={`fas fa-arrows-alt-v ${styles.inputIcon}`}></i>
                <input
                  type="number"
                  placeholder="Height (ft)"
                  value={surface.height || ''}
                  onChange={(e) => updateSurface('height', e.target.value)}
                  className={styles.input}
                  min="0"
                  step="0.1"
                  disabled={disabled}
                  title="Enter the surface height in feet"
                  aria-label="Surface height"
                />
              </div>
            </>
          )}
        </>
      ) : measurementType === 'linear-foot' ? (
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
      ) : (
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
      )}

      <span className={styles.sqft}>
        <i className={`fas fa-square-full ${styles.sqftIcon}`}></i>
        {(parseFloat(surface.sqft) || 0).toFixed(2)} {measurementType === 'by-unit' ? 'units' : measurementType === 'linear-foot' ? 'ft' : 'sqft'}
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