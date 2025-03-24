// src/components/Calculator/WorkItem/WorkItem.jsx
import React, { useCallback } from 'react';
import WorkItem1 from './WorkItem1';
import WorkItem3 from './WorkItem3';
import WorkItem4 from './WorkItem4';
import styles from './WorkItem.module.css';
import { WORK_TYPES, DEFAULT_SUBTYPES } from '../calculatorFunctions';

export default function WorkItem({ 
  catIndex, 
  workIndex, 
  workItem, 
  setCategories, 
  disabled = false 
}) {
  const updateWorkItem = useCallback((field, value) => {
    if (disabled) return;
    setCategories(prev => {
      const newCategories = [...prev];
      const category = { ...newCategories[catIndex] };
      const workItems = [...category.workItems];
      const item = { ...workItems[workIndex] };

      if (['materialCost', 'laborCost', 'linearFt', 'units'].includes(field)) {
        item[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
      } else if (field === 'type') {
        item[field] = value;
        item.subtype = DEFAULT_SUBTYPES[value] || ''; // Use centralized default subtype
        item.surfaces = WORK_TYPES.surfaceBased.includes(value) 
          ? (item.surfaces?.length > 0 ? item.surfaces : [{ width: '10', height: '10', sqft: 100, manualSqft: false }]) 
          : [];
        item.linearFt = WORK_TYPES.linearFtBased.includes(value) ? (item.linearFt || '10') : '';
        item.units = WORK_TYPES.unitBased.includes(value) ? (item.units || '1') : '';
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
  }, [disabled, catIndex, workIndex, setCategories]);

  const removeWorkItem = useCallback(() => {
    if (disabled) return;
    setCategories(prev => prev.map((cat, i) => 
      i === catIndex 
        ? { ...cat, workItems: cat.workItems.filter((_, j) => j !== workIndex) }
        : cat
    ));
  }, [disabled, catIndex, workIndex, setCategories]);

  const addSurface = useCallback(() => {
    if (disabled) return;
    setCategories(prev => {
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

  const workItemClass = `${styles.workCard} ${styles[`workBackground${workIndex % 5}`]}`;

  return (
    <div className={workItemClass}>
      <WorkItem1 workItem={workItem} updateWorkItem={updateWorkItem} disabled={disabled} />
      <WorkItem3
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        addSurface={addSurface}
        catIndex={catIndex}
        workIndex={workIndex}
        setCategories={setCategories}
        disabled={disabled}
      />
      <WorkItem4
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        removeWorkItem={removeWorkItem}
        disabled={disabled}
      />
    </div>
  );
}