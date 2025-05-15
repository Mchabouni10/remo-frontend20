// src/components/Calculator/WorkItem/WorkItem.jsx
import React, { useCallback, useState, useRef } from 'react';
import SurfaceInput from '../SurfaceInput/SurfaceInput';
import { WORK_TYPES as WORK_TYPES1, SUBTYPE_OPTIONS as SUBTYPE_OPTIONS1, DEFAULT_SUBTYPES as DEFAULT_SUBTYPES1 } from '../data/workTypes';
import { WORK_TYPES as WORK_TYPES2, SUBTYPE_OPTIONS as SUBTYPE_OPTIONS2, DEFAULT_SUBTYPES as DEFAULT_SUBTYPES2 } from '../data/workTypes2';
import styles from './WorkItem.module.css';

// Merge WORK_TYPES, SUBTYPE_OPTIONS, and DEFAULT_SUBTYPES
const WORK_TYPES = { ...WORK_TYPES1, ...WORK_TYPES2 };
const SUBTYPE_OPTIONS = { ...SUBTYPE_OPTIONS1, ...SUBTYPE_OPTIONS2 };
const DEFAULT_SUBTYPES = { ...DEFAULT_SUBTYPES1, ...DEFAULT_SUBTYPES2 };

// Infer type from name if missing
const inferTypeFromName = (name) => {
  if (!name) return '';
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (/installation/i.test(name)) return 'outlet-installation'; // Adjust based on WORK_TYPES
  return normalizedName;
};

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
  const inputTimeoutRef = useRef(null);

  const categoryKey = workItem.key
    ? workItem.key
    : workItem.category
      ? workItem.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')
      : '';

  // Normalize workItem.type if missing
  const effectiveType = workItem.type || inferTypeFromName(workItem.name);

  if (!WORK_TYPES || Object.keys(WORK_TYPES).length === 0) {
    console.error('WORK_TYPES is empty or not loaded.');
  }

  const availableTypes = (() => {
    if (categoryKey && categoryKey in WORK_TYPES) {
      return [
        ...WORK_TYPES[categoryKey].surfaceBased,
        ...WORK_TYPES[categoryKey].linearFtBased,
        ...WORK_TYPES[categoryKey].unitBased,
        ...(categoryKey !== 'general'
          ? [
              ...WORK_TYPES.general.surfaceBased,
              ...WORK_TYPES.general.linearFtBased,
              ...WORK_TYPES.general.unitBased,
            ]
          : []),
      ];
    }
    return Object.values(WORK_TYPES).reduce((types, category) => [
      ...types,
      ...category.surfaceBased,
      ...category.linearFtBased,
      ...category.unitBased,
    ], []);
  })();

  // Determine default measurement type based on WORK_TYPES category or name
  const getDefaultMeasurementType = (type, name) => {
    if (!type && !name) return 'single-surface';
    const effectiveType = type || inferTypeFromName(name);
    for (const category of Object.values(WORK_TYPES)) {
      if (effectiveType && category.surfaceBased.includes(effectiveType)) return 'single-surface';
      if (effectiveType && category.linearFtBased.includes(effectiveType)) return 'linear-foot';
      if (effectiveType && category.unitBased.includes(effectiveType)) return 'by-unit';
    }
    if (name && /installation/i.test(name)) return 'by-unit';
    return 'single-surface';
  };

  const updateWorkItem = useCallback(
    (field, value) => {
      if (disabled) return;
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      inputTimeoutRef.current = setTimeout(() => {
        setCategories((prev) => {
          const newCategories = [...prev];
          const category = { ...newCategories[catIndex] };
          const workItems = [...category.workItems];
          const item = { ...workItems[workIndex] };

          if (['materialCost', 'laborCost'].includes(field)) {
            item[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
          } else if (field === 'type') {
            item[field] = value;
            item.subtype = DEFAULT_SUBTYPES[value] || '';
            const measurementType = getDefaultMeasurementType(value, item.name);
            item.surfaces = item.surfaces?.length > 0 && item.surfaces[0].measurementType === measurementType
              ? item.surfaces
              : [{
                  measurementType,
                  ...(measurementType === 'single-surface' ? { width: '10', height: '10', sqft: 100, manualSqft: false } : {}),
                  ...(measurementType === 'linear-foot' ? { linearFt: '10', sqft: 10 } : {}),
                  ...(measurementType === 'by-unit' ? { units: '1', sqft: 1 } : {}),
                  ...(measurementType === 'room-surface' ? {
                    length: '12',
                    width: '10',
                    roomShape: 'rectangular',
                    roomHeight: '8',
                    doors: [{ size: '3x7', width: 3, height: 7, area: 21 }],
                    windows: [{ size: '3x4', width: 3, height: 4, area: 12 }],
                    closets: [{ size: '4x7', width: 4, height: 7, area: 28 }],
                    sqft: 184,
                  } : {}),
                }];
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
      }, 50);
    },
    [disabled, catIndex, workIndex, setCategories]
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
      const measurementType = item.surfaces?.length > 0 ? item.surfaces[0].measurementType : getDefaultMeasurementType(item.type, item.name);

      item.surfaces = [...(item.surfaces || []), {
        measurementType,
        ...(measurementType === 'single-surface' ? { width: '10', height: '10', sqft: 100, manualSqft: false } : {}),
        ...(measurementType === 'linear-foot' ? { linearFt: '10', sqft: 10 } : {}),
        ...(measurementType === 'by-unit' ? { units: '1', sqft: 1 } : {}),
        ...(measurementType === 'room-surface' ? {
          length: '12',
          width: '10',
          roomShape: 'rectangular',
          roomHeight: '8',
          doors: [{ size: '3x7', width: 3, height: 7, area: 21 }],
          windows: [{ size: '3x4', width: 3, height: 4, area: 12 }],
          closets: [{ size: '4x7', width: 4, height: 7, area: 28 }],
          sqft: 184,
        } : {}),
      }];
      workItems[workIndex] = item;
      category.workItems = workItems;
      newCategories[catIndex] = category;
      return newCategories;
    });
  }, [disabled, catIndex, workIndex, setCategories]);

  const materialCost = parseFloat(workItem.materialCost) || 0;
  const laborCost = parseFloat(workItem.laborCost) || 0;
  const costOptions = Array.from({ length: 21 }, (_, i) => i.toString()).concat('Custom');

  const primaryMeasurementType = workItem.surfaces?.length > 0
    ? workItem.surfaces[0].measurementType
    : getDefaultMeasurementType(effectiveType, workItem.name);

  const materialLabel = primaryMeasurementType === 'linear-foot'
    ? 'Material Cost per Linear Ft ($)'
    : primaryMeasurementType === 'by-unit'
    ? 'Material Cost per Unit ($)'
    : 'Material Cost per Sqft ($)';

  const laborLabel = primaryMeasurementType === 'linear-foot'
    ? 'Labor Cost per Linear Ft ($)'
    : primaryMeasurementType === 'by-unit'
    ? 'Labor Cost per Unit ($)'
    : 'Labor Cost per Sqft ($)';

  const totalMaterialCost = workItem.surfaces?.reduce((sum, surf) => {
    const qty = surf.measurementType === 'linear-foot'
      ? parseFloat(surf.linearFt) || 0
      : surf.measurementType === 'by-unit'
      ? parseFloat(surf.units) || parseFloat(surf.sqft) || 0
      : parseFloat(surf.sqft) || 0;
    return sum + qty * materialCost;
  }, 0) || 0;

  const totalLaborCost = workItem.surfaces?.reduce((sum, surf) => {
    const qty = surf.measurementType === 'linear-foot'
      ? parseFloat(surf.linearFt) || 0
      : surf.measurementType === 'by-unit'
      ? parseFloat(surf.units) || parseFloat(surf.sqft) || 0
      : parseFloat(surf.sqft) || 0;
    return sum + qty * laborCost;
  }, 0) || 0;

  const totalCost = (totalMaterialCost + totalLaborCost).toFixed(2);

  const totalUnits = workItem.surfaces?.reduce((sum, surf) => {
    return sum + (surf.measurementType === 'linear-foot'
      ? parseFloat(surf.linearFt) || 0
      : surf.measurementType === 'by-unit'
      ? parseFloat(surf.units) || parseFloat(surf.sqft) || 0
      : parseFloat(surf.sqft) || 0);
  }, 0) || 0;

  const unitLabel = primaryMeasurementType === 'linear-foot' ? 'ft' : primaryMeasurementType === 'by-unit' ? 'units' : 'sqft';

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
            aria-label="Work item name"
          />
        </div>
        <div className={styles.inputWrapper}>
          <i className={`fas fa-list-alt ${styles.inputIcon}`}></i>
          <select
            value={effectiveType}
            onChange={(e) => updateWorkItem('type', e.target.value)}
            className={styles.select}
            disabled={disabled || !workItem.category || !categoryKey}
            aria-label="Work item type"
          >
            <option value="">
              {workItem.category && categoryKey ? 'Select Type' : 'Select a Category'}
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

      {effectiveType && SUBTYPE_OPTIONS[effectiveType] && (
        <div className={styles.workItemRow}>
          <label>
            <i className="fas fa-layer-group"></i> Subtype:
          </label>
          <select
            value={workItem.subtype || DEFAULT_SUBTYPES[effectiveType] || ''}
            onChange={(e) => updateWorkItem('subtype', e.target.value)}
            className={styles.select}
            disabled={disabled}
            aria-label="Work item subtype"
          >
            <option value="">Select Subtype</option>
            {(SUBTYPE_OPTIONS[effectiveType] || []).map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.surfaces}>
        {workItem.surfaces?.length > 0 ? (
          workItem.surfaces.map((surf, surfIndex) => (
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
          ))
        ) : (
          <SurfaceInput
            catIndex={catIndex}
            workIndex={workIndex}
            surfIndex={0}
            surface={{
              measurementType: getDefaultMeasurementType(effectiveType, workItem.name),
              ...(getDefaultMeasurementType(effectiveType, workItem.name) === 'single-surface' ? { width: '10', height: '10', sqft: 100, manualSqft: false } : {}),
              ...(getDefaultMeasurementType(effectiveType, workItem.name) === 'linear-foot' ? { linearFt: '10', sqft: 10 } : {}),
              ...(getDefaultMeasurementType(effectiveType, workItem.name) === 'by-unit' ? { units: '1', sqft: 1 } : {}),
              ...(getDefaultMeasurementType(effectiveType, workItem.name) === 'room-surface' ? {
                length: '12',
                width: '10',
                roomShape: 'rectangular',
                roomHeight: '8',
                doors: [{ size: '3x7', width: 3, height: 7, area: 21 }],
                windows: [{ size: '3x4', width: 3, height: 4, area: 12 }],
                closets: [{ size: '4x7', width: 4, height: 7, area: 28 }],
                sqft: 184,
              } : {}),
            }}
            setCategories={setCategories}
            showRemove={false}
            disabled={disabled}
          />
        )}
        {!disabled && (
          <button
            onClick={addSurface}
            className={styles.addSurfaceButton}
            title="Add Surface"
            aria-label="Add surface"
          >
            <i className="fas fa-plus"></i> Add Surface
          </button>
        )}
      </div>

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
              aria-label="Material cost selection"
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
                step="0.01"
                value={materialCost}
                onChange={(e) => updateWorkItem('materialCost', e.target.value)}
                className={styles.input}
                placeholder="0.00"
                disabled={disabled || !isMaterialCustomMode}
                aria-label="Material cost"
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
              aria-label="Labor cost selection"
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
                step="0.01"
                value={laborCost}
                onChange={(e) => updateWorkItem('laborCost', e.target.value)}
                className={styles.input}
                placeholder="0.00"
                disabled={disabled || !isLaborCustomMode}
                aria-label="Labor cost"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.costDisplay}>
        <span className={styles.cost}>
          Material: ${totalMaterialCost.toFixed(2)}
        </span>
        <span className={styles.cost}>
          Labor: ${totalLaborCost.toFixed(2)}
        </span>
        <span className={styles.cost}>
          Total: ${totalCost}
        </span>
        <span className={styles.units}>
          Total: {totalUnits.toFixed(2)} {unitLabel}
        </span>
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
            aria-label="Work notes"
          />
        </div>
        {!disabled && (
          <button
            onClick={removeWorkItem}
            className={styles.removeButton}
            title="Remove Work Item"
            aria-label="Remove work item"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>
    </div>
  );
}
