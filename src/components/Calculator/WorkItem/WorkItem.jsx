// src/components/Calculator/WorkItem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import WorkItem1 from './WorkItem1';
import WorkItem2 from './WorkItem2';
import WorkItem3 from './WorkItem3';
import WorkItem45 from './WorkItem4'; 
import styles from './WorkItem.module.css';

export default function WorkItem({ 
  catIndex, 
  workIndex, 
  workItem, 
  setCategories, 
  disabled = false 
}) {
  const [useManualPricing, setUseManualPricing] = useState(false);
  const [useManualBasePrice, setUseManualBasePrice] = useState(false);

  // Memoize helper functions
  const isSurfaceBased = useCallback((type) => [
    'kitchen-flooring', 'kitchen-tiles', 'kitchen-backsplash',
    'bathroom-flooring', 'bathroom-tiles', 'bathroom-shower-tiles',
    'living-room-flooring', 'bedroom-flooring', 'exterior-deck',
    'general-drywall', 'general-painting'
  ].includes(type), []);

  const isLinearFtBased = useCallback((type) => [
    'kitchen-cabinets', 'bathroom-vanity', 'general-trim',
    'general-crown-molding', 'general-baseboards'
  ].includes(type), []);

  const isUnitBased = useCallback((type) => [
    'kitchen-sink', 'kitchen-faucet', 'kitchen-lighting',
    'bathroom-faucet', 'bathroom-shower-faucet', 'bathroom-fan',
    'bathroom-towel-warmer', 'living-room-lighting',
    'bedroom-lighting', 'general-lighting', 'general-doors',
    'general-windows'
  ].includes(type), []);

  // Optimize useEffect
  useEffect(() => {
    if (workItem.basePrice === undefined) {
      updateWorkItem('basePrice', '0.00');
    }
  }, [workItem.basePrice]);

  // Memoize update function
  const updateWorkItem = useCallback((field, value) => {
    if (disabled) return;

    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      const category = { ...newCategories[catIndex] };
      const workItems = [...category.workItems];
      const item = { ...workItems[workIndex] };

      if (field === 'basePrice') {
        item.basePrice = value;
        if (!useManualPricing) {
          const numericBasePrice = parseFloat(value) || 0;
          item.materialCost = Number((numericBasePrice * 0.6).toFixed(2));
          item.laborCost = Number((numericBasePrice * 0.4).toFixed(2));
        }
      } else if (['linearFt', 'units', 'materialCost', 'laborCost'].includes(field)) {
        item[field] = value === '' ? '' : Math.max(0, Number(parseFloat(value) || 0));
      } else if (field === 'type') {
        item[field] = value;
        item.subtype = getDefaultSubtype(value);
        item.surfaces = isSurfaceBased(value) 
          ? (item.surfaces?.length > 0 ? item.surfaces : [{ width: '10', height: '10', sqft: 100, manualSqft: false }]) 
          : [];
        item.linearFt = isLinearFtBased(value) ? (item.linearFt || '10') : '';
        item.units = isUnitBased(value) ? (item.units || '1') : '';
        item.basePrice = item.basePrice ?? '0.00';
        if (!useManualPricing) {
          const numericBasePrice = parseFloat(item.basePrice) || 0;
          item.materialCost = Number((numericBasePrice * 0.6).toFixed(2));
          item.laborCost = Number((numericBasePrice * 0.4).toFixed(2));
        }
      } else {
        item[field] = value;
      }

      workItems[workIndex] = item;
      category.workItems = workItems;
      newCategories[catIndex] = category;
      return newCategories;
    });
  }, [disabled, catIndex, workIndex, useManualPricing, isSurfaceBased, isLinearFtBased, isUnitBased]);

  const removeWorkItem = useCallback(() => {
    if (disabled) return;
    setCategories(prev => prev.map((cat, i) => 
      i === catIndex 
        ? { ...cat, workItems: cat.workItems.filter((_, j) => j !== workIndex) }
        : cat
    ));
  }, [disabled, catIndex, workIndex]);

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
  }, [disabled, catIndex, workIndex]);

  const getDefaultSubtype = (type) => {
    const subtypes = {
      'kitchen-flooring': 'hardwood',
      'kitchen-tiles': 'ceramic',
      'kitchen-backsplash': 'subway',
      // ... rest of the subtypes remain the same
    };
    return subtypes[type] || '';
  };

  const workItemClass = `${styles.workCard} ${styles[`workBackground${workIndex % 5}`]}`;

  return (
    <div className={workItemClass}>
      <WorkItem1
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        disabled={disabled}
      />
      <WorkItem2
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        useManualBasePrice={useManualBasePrice}
        setUseManualBasePrice={setUseManualBasePrice}
        isSurfaceBased={isSurfaceBased(workItem.type)}
        isLinearFtBased={isLinearFtBased(workItem.type)}
        disabled={disabled}
      />
      <WorkItem3
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        addSurface={addSurface}
        catIndex={catIndex}
        workIndex={workIndex}
        setCategories={setCategories}
        isSurfaceBased={isSurfaceBased(workItem.type)}
        isLinearFtBased={isLinearFtBased(workItem.type)}
        isUnitBased={isUnitBased(workItem.type)}
        disabled={disabled}
      />
      <WorkItem45
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        removeWorkItem={removeWorkItem}
        useManualPricing={useManualPricing}
        setUseManualPricing={setUseManualPricing}
        isSurfaceBased={isSurfaceBased(workItem.type)}
        isLinearFtBased={isLinearFtBased(workItem.type)}
        disabled={disabled}
      />
    </div>
  );
}