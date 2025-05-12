// src/components/Calculator/WorkItem/WorkItem.jsx
import React, { useCallback, useState } from 'react';
import SurfaceInput from '../SurfaceInput/SurfaceInput';
import { WORK_TYPES as WORK_TYPES1, SUBTYPE_OPTIONS as SUBTYPE_OPTIONS1, DEFAULT_SUBTYPES as DEFAULT_SUBTYPES1 } from '../data/workTypes';
import { WORK_TYPES as WORK_TYPES2, SUBTYPE_OPTIONS as SUBTYPE_OPTIONS2, DEFAULT_SUBTYPES as DEFAULT_SUBTYPES2 } from '../data/workTypes2';
import styles from './WorkItem.module.css';

// Merge WORK_TYPES, SUBTYPE_OPTIONS, and DEFAULT_SUBTYPES from both files
const WORK_TYPES = { ...WORK_TYPES1, ...WORK_TYPES2 };
const SUBTYPE_OPTIONS = { ...SUBTYPE_OPTIONS1, ...SUBTYPE_OPTIONS2 };
const DEFAULT_SUBTYPES = { ...DEFAULT_SUBTYPES1, ...DEFAULT_SUBTYPES2 };

export default function WorkItem({
  catIndex,
  workIndex,
  workItem,
  setCategories,
  disabled = false,
}) {
  const [isMaterialCustomMode, setIsMaterialCustomMode] = useState(
    !Array.from({ length: 21 }, (_, i) => i.toString()).includes((parseFloat(workItem.materialCost) || 0).toString())
  );
  const [isLaborCustomMode, setIsLaborCustomMode] = useState(
    !Array.from({ length: 21 }, (_, i) => i.toString()).includes((parseFloat(workItem.laborCost) || 0).toString())
  );

  // Normalize category name to match WORK_TYPES keys (e.g., "Electrical" → "electrical")
  const categoryKey = workItem.category
    ? workItem.category
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '') // Remove spaces and special characters
    : '';

  // Validate WORK_TYPES
  if (!WORK_TYPES || Object.keys(WORK_TYPES).length === 0) {
    console.error('WORK_TYPES is empty or not loaded. Check import path or data structure.');
  } else {
    console.debug('WORK_TYPES keys:', Object.keys(WORK_TYPES));
  }

  // Populate available types, empty if categoryKey is invalid or undefined
  const availableTypes = categoryKey && categoryKey in WORK_TYPES
    ? [
        ...WORK_TYPES[categoryKey].surfaceBased,
        ...WORK_TYPES[categoryKey].linearFtBased,
        ...WORK_TYPES[categoryKey].unitBased,
      ]
    : [];

  // Log warning for debugging if categoryKey is invalid or undefined
  if (!workItem.category || !categoryKey || !(categoryKey in WORK_TYPES)) {
    console.warn(
      `Invalid or missing category for workItem: category="${workItem.category}", categoryKey="${categoryKey}", catIndex=${catIndex}, workIndex=${workIndex}, workItem=`,
      workItem
    );
  }

  const updateWorkItem = useCallback(
    (field, value) => {
      if (disabled) return;
      setCategories((prev) => {
        const newCategories = [...prev];
        const category = { ...newCategories[catIndex] };
        const workItems = [...category.workItems];
        const item = { ...workItems[workIndex] };

        if (['materialCost', 'laborCost', 'linearFt', 'units'].includes(field)) {
          item[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        } else if (field === 'type') {
          item[field] = value;
          item.subtype = DEFAULT_SUBTYPES[value] || '';
          item.surfaces = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.surfaceBased.includes(value))
            ? item.surfaces?.length > 0
              ? item.surfaces
              : [{ width: '10', height: '10', sqft: 100, manualSqft: false }]
            : [];
          item.linearFt = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.linearFtBased.includes(value))
            ? item.linearFt || '10'
            : '';
          item.units = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.unitBased.includes(value))
            ? item.units || '1'
            : '';
          item.materialCost = item.materialCost ?? '0.00';
          item.laborCost = item.laborCost ?? '0.00';
        } else {
          item[field] = value;
        }

        workItems[workIndex] = item;
        category.workItems = workItems;
        newCategories[catIndex] = category;
        return newCategories;
      });
    },
    [disabled, catIndex, workIndex, setCategories, categoryKey]
  );

  const removeWorkItem = useCallback(() => {
    if (disabled) return;
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === catIndex ? { ...cat, workItems: cat.workItems.filter((_, j) => j !== workIndex) } : cat
      )
    );
  }, [disabled, catIndex, workIndex, setCategories]);

  const addSurface = useCallback(() => {
    if (disabled) return;
    setCategories((prev) => {
      const newCategories = [...prev];
      const category = { ...newCategories[catIndex] };
      const workItems = [...category.workItems];
      const item = { ...workItems[workIndex] };

      item.surfaces = [...(item.surfaces || []), { width: '10', height: '10', sqft: 100, manualSqft: false }];
      workItems[workIndex] = item;
      category.workItems = workItems;
      newCategories[catIndex] = category;
      return newCategories;
    });
  }, [disabled, catIndex, workIndex, setCategories]);

  const isSurfaceBased = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.surfaceBased.includes(workItem.type)) || false;
  const isLinearFtBased = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.linearFtBased.includes(workItem.type)) || false;
  const isUnitBased = (categoryKey in WORK_TYPES && WORK_TYPES[categoryKey]?.unitBased.includes(workItem.type)) || false;
  const materialCost = parseFloat(workItem.materialCost) || 0;
  const laborCost = parseFloat(workItem.laborCost) || 0;
  const costOptions = Array.from({ length: 21 }, (_, i) => i.toString()).concat('Custom');

  const materialLabel = isSurfaceBased
    ? 'Material Cost per Sqft ($)'
    : isLinearFtBased
    ? 'Material Cost per Linear Ft ($)'
    : 'Material Cost per Unit ($)';
  const laborLabel = isSurfaceBased
    ? 'Labor Cost per Sqft ($)'
    : isLinearFtBased
    ? 'Labor Cost per Linear Ft ($)'
    : 'Labor Cost per Unit ($)';

  const handleMaterialSelectChange = (value) => {
    if (value === 'Custom') {
      setIsMaterialCustomMode(true);
    } else {
      setIsMaterialCustomMode(false);
      updateWorkItem('materialCost', value);
    }
  };

  const handleLaborSelectChange = (value) => {
    if (value === 'Custom') {
      setIsLaborCustomMode(true);
    } else {
      setIsLaborCustomMode(false);
      updateWorkItem('laborCost', value);
    }
  };

  return (
    <div className={styles.workCard}>
      <div className={styles.workLabel}>Work {workIndex + 1}</div>
      <div className={styles.workItemRow}>
        <div className={styles.inputWrapper}>
          <i className={`fas fa-tools ${styles.inputIcon}`}></i>
          <input
            type="text"
            value={workItem.name || ''}
            onChange={(e) => updateWorkItem('name', e.target.value)}
            placeholder="Work Item Name"
            className={styles.input}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapper}>
          <i className={`fas fa-list-alt ${styles.inputIcon}`}></i>
          <select
            value={workItem.type || ''}
            onChange={(e) => updateWorkItem('type', e.target.value)}
            className={styles.select}
            disabled={disabled || !workItem.category || !categoryKey || !(categoryKey in WORK_TYPES)}
          >
            <option value="">
              {workItem.category && categoryKey && categoryKey in WORK_TYPES
                ? 'Select Type'
                : workItem.category
                ? 'Invalid Category'
                : 'Select a Category'}
            </option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type
                  .replace(/-/g, ' ')
                  .replace(categoryKey, categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1))
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {workItem.type && SUBTYPE_OPTIONS[workItem.type] && (
        <div className={styles.workItemRow}>
          <label>
            <i className="fas fa-layer-group"></i> Subtype:
          </label>
          <select
            value={workItem.subtype || DEFAULT_SUBTYPES[workItem.type] || ''}
            onChange={(e) => updateWorkItem('subtype', e.target.value)}
            className={styles.select}
            disabled={disabled}
          >
            <option value="">Select Subtype</option>
            {(SUBTYPE_OPTIONS[workItem.type] || []).map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

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
            <button
              onClick={addSurface}
              className={styles.addSurfaceButton}
              title="Add Surface"
            >
              <i className="fas fa-plus"></i> Add Surface
            </button>
          )}
        </div>
      )}
      {isLinearFtBased && (
        <div className={styles.workItemRow}>
          <label>
            <i className="fas fa-ruler-horizontal"></i> Linear Feet:
          </label>
          <input
            type="number"
            value={workItem.linearFt || ''}
            onChange={(e) => updateWorkItem('linearFt', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </div>
      )}
      {isUnitBased && (
        <div className={styles.workItemRow}>
          <label>
            <i className="fas fa-boxes"></i> Units:
          </label>
          <input
            type="number"
            value={workItem.units || ''}
            onChange={(e) => updateWorkItem('units', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </div>
      )}

      <div className={styles.pricingSection}>
        <div className={styles.pricingField}>
          <label title={materialLabel}>
            <i className="fas fa-dollar-sign"></i> {materialLabel}:
          </label>
          <div className={styles.costWrapper}>
            <select
              value={isMaterialCustomMode ? 'Custom' : materialCost.toString()}
              onChange={(e) => handleMaterialSelectChange(e.target.value)}
              className={styles.select}
              disabled={disabled}
            >
              {costOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'Custom' ? 'Custom' : `$${option}`}
                </option>
              ))}
            </select>
            <div className={styles.inputWrapper}>
              <i className={`fas fa-dollar-sign ${styles.inputIcon}`}></i>
              <input
                type="number"
                value={materialCost}
                onChange={(e) => updateWorkItem('materialCost', e.target.value)}
                className={styles.input}
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={disabled || !isMaterialCustomMode}
              />
            </div>
          </div>
        </div>
        <div className={styles.pricingField}>
          <label title={laborLabel}>
            <i className="fas fa-user-clock"></i> {laborLabel}:
          </label>
          <div className={styles.costWrapper}>
            <select
              value={isLaborCustomMode ? 'Custom' : laborCost.toString()}
              onChange={(e) => handleLaborSelectChange(e.target.value)}
              className={styles.select}
              disabled={disabled}
            >
              {costOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'Custom' ? 'Custom' : `$${option}`}
                </option>
              ))}
            </select>
            <div className={styles.inputWrapper}>
              <i className={`fas fa-dollar-sign ${styles.inputIcon}`}></i>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => updateWorkItem('laborCost', e.target.value)}
                className={styles.input}
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={disabled || !isLaborCustomMode}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.notesSection}>
        <div className={styles.inputWrapper}>
          <i className={`fas fa-sticky-note ${styles.inputIcon}`}></i>
          <input
            type="text"
            placeholder="Work Notes"
            value={workItem.notes || ''}
            onChange={(e) => updateWorkItem('notes', e.target.value)}
            className={styles.input}
            disabled={disabled}
          />
        </div>
        {!disabled && (
          <button
            onClick={removeWorkItem}
            className={styles.removeButton}
            title="Remove Work Item"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
    </div>
  );
}