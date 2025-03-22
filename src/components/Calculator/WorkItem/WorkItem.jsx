// src/components/Calculator/WorkItem.jsx
import React, { useState, useEffect } from 'react';
import WorkItem1 from './WorkItem1';
import WorkItem2 from './WorkItem2';
import WorkItem3 from './WorkItem3';
import WorkItem4 from './WorkItem4';
import WorkItem5 from './WorkItem5';
import styles from './WorkItem.module.css';

export default function WorkItem({ catIndex, workIndex, workItem, setCategories, disabled = false }) {
  const [useManualPricing, setUseManualPricing] = useState(false);
  const [useManualBasePrice, setUseManualBasePrice] = useState(false);

  useEffect(() => {
    if (workItem.basePrice === undefined) {
      updateWorkItem('basePrice', '0.00');
    }
  }, [workItem.basePrice]);

  const updateWorkItem = (field, value) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) => {
            if (j === workIndex) {
              const updated = { ...item };
              if (field === 'basePrice') {
                updated.basePrice = value;
                if (!useManualPricing) {
                  const numericBasePrice = parseFloat(value) || 0;
                  updated.materialCost = numericBasePrice * 0.6;
                  updated.laborCost = numericBasePrice * 0.4;
                }
              } else if (['linearFt', 'units', 'materialCost', 'laborCost'].includes(field)) {
                updated[field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
              } else if (field === 'type') {
                updated[field] = value;
                updated.subtype = getDefaultSubtype(value);
                updated.surfaces = isSurfaceBased(value) ? (item.surfaces.length > 0 ? item.surfaces : [{ width: '10', height: '10', sqft: 100, manualSqft: false }]) : [];
                updated.linearFt = isLinearFtBased(value) ? (item.linearFt || '10') : '';
                updated.units = isUnitBased(value) ? (item.units || '1') : '';
                updated.basePrice = item.basePrice !== undefined ? item.basePrice : '0.00';
                if (!useManualPricing) {
                  const numericBasePrice = parseFloat(updated.basePrice) || 0;
                  updated.materialCost = numericBasePrice * 0.6;
                  updated.laborCost = numericBasePrice * 0.4;
                }
              } else {
                updated[field] = value;
              }
              return updated;
            }
            return item;
          });
          return { ...cat, workItems: updatedWorkItems };
        }
        return cat;
      })
    );
  };

  const removeWorkItem = () => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) =>
        i === catIndex ? { ...cat, workItems: cat.workItems.filter((_, j) => j !== workIndex) } : cat
      )
    );
  };

  const addSurface = () => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) => {
        if (i === catIndex) {
          const updatedWorkItems = cat.workItems.map((item, j) =>
            j === workIndex
              ? { ...item, surfaces: [...item.surfaces, { width: '10', height: '10', sqft: 100, manualSqft: false }] }
              : item
          );
          return { ...cat, workItems: updatedWorkItems };
        }
        return cat;
      })
    );
  };

  const isSurfaceBased = (type) =>
    [
      'kitchen-flooring', 'kitchen-tiles', 'kitchen-backsplash',
      'bathroom-flooring', 'bathroom-tiles', 'bathroom-shower-tiles',
      'living-room-flooring', 'bedroom-flooring', 'exterior-deck',
      'general-drywall', 'general-painting'
    ].includes(type);

  const isLinearFtBased = (type) =>
    [
      'kitchen-cabinets', 'bathroom-vanity', 'general-trim',
      'general-crown-molding', 'general-baseboards'
    ].includes(type);

  const isUnitBased = (type) =>
    [
      'kitchen-sink', 'kitchen-faucet', 'kitchen-lighting',
      'bathroom-faucet', 'bathroom-shower-faucet', 'bathroom-fan',
      'bathroom-towel-warmer', 'living-room-lighting',
      'bedroom-lighting', 'general-lighting', 'general-doors',
      'general-windows'
    ].includes(type);

  const getDefaultSubtype = (type) => {
    switch (type) {
      case 'kitchen-flooring': return 'hardwood';
      case 'kitchen-tiles': return 'ceramic';
      case 'kitchen-backsplash': return 'subway';
      case 'kitchen-cabinets': return 'standard';
      case 'kitchen-sink': return 'stainless';
      case 'kitchen-faucet': return 'single-handle';
      case 'kitchen-lighting': return 'pendant';
      case 'bathroom-flooring': return 'tile';
      case 'bathroom-tiles': return 'ceramic';
      case 'bathroom-shower-tiles': return 'porcelain';
      case 'bathroom-vanity': return 'single-sink';
      case 'bathroom-faucet': return 'single-handle';
      case 'bathroom-shower-faucet': return 'rain';
      case 'bathroom-fan': return 'standard';
      case 'bathroom-towel-warmer': return 'wall-mounted';
      case 'living-room-flooring': return 'hardwood';
      case 'living-room-lighting': return 'chandelier';
      case 'bedroom-flooring': return 'carpet';
      case 'bedroom-lighting': return 'recessed';
      case 'exterior-deck': return 'wood';
      case 'general-drywall': return 'standard';
      case 'general-painting': return 'interior';
      case 'general-lighting': return 'recessed';
      case 'general-doors': return 'interior';
      case 'general-windows': return 'double-hung';
      case 'general-trim': return 'standard';
      case 'general-crown-molding': return 'simple';
      case 'general-baseboards': return 'standard';
      default: return '';
    }
  };

  // Dynamic class for work item background based on workIndex
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
      <WorkItem4
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        useManualPricing={useManualPricing}
        setUseManualPricing={setUseManualPricing}
        isSurfaceBased={isSurfaceBased(workItem.type)}
        isLinearFtBased={isLinearFtBased(workItem.type)}
        disabled={disabled}
      />
      <WorkItem5
        workItem={workItem}
        updateWorkItem={updateWorkItem}
        removeWorkItem={removeWorkItem}
        disabled={disabled}
      />
    </div>
  );
}