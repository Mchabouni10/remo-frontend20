//src/components/Calculator/utils/calculatorUtils.js
import { WORK_TYPES, MEASUREMENT_TYPES } from '../data/workTypes';

// Get units for an item
export function getUnits(item) {
  if (!item || typeof item !== 'object') {
    console.warn('getUnits: Invalid item', item);
    return 0;
  }
  const type = item.type;
  if (!type) {
    console.warn('getUnits: No valid type provided', item);
    return 0;
  }

  if (!(type in MEASUREMENT_TYPES)) {
    console.warn(`getUnits: Unknown type "${type}" not in MEASUREMENT_TYPES`, item);
    return 0;
  }

  // Initialize surfaces if missing
  const surfaces = Array.isArray(item.surfaces) ? item.surfaces : [];

  // Check surfaceBased
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(type))) {
    const total = surfaces.reduce((sum, surf, index) => {
      if (!surf || !surf.measurementType || surf.measurementType !== 'single-surface' || isNaN(parseFloat(surf.sqft))) {
        console.warn(`getUnits: Invalid surface at index ${index} for surfaceBased type "${type}"`, { surf, measurementType: surf?.measurementType });
        return sum;
      }
      const sqft = parseFloat(surf.sqft) || 0;
      return sum + sqft;
    }, 0);
    if (total === 0 && surfaces.length > 0) {
      console.debug(`getUnits: Zero units for surfaceBased item type "${type}"`, { item, surfaces });
    }
    return total;
  }

  // Check linearFtBased
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(type))) {
    const total = surfaces.reduce((sum, surf, index) => {
      if (!surf || !surf.measurementType || surf.measurementType !== 'linear-foot') {
        console.warn(`getUnits: Invalid surface at index ${index} for linearFtBased type "${type}"`, { surf, measurementType: surf?.measurementType });
        return sum;
      }
      const linearFt = parseFloat(surf.linearFt);
      if (isNaN(linearFt) || linearFt <= 0) {
        console.warn(`getUnits: Invalid or non-positive linearFt at index ${index} for linearFtBased type "${type}"`, { surf, linearFt });
        return sum;
      }
      return sum + linearFt;
    }, 0);
    if (total === 0 && surfaces.length > 0) {
      console.debug(`getUnits: Zero units for linearFtBased item type "${type}"`, { item, surfaces });
    }
    return total;
  }

  // Check unitBased
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(type))) {
    const total = surfaces.reduce((sum, surf, index) => {
      if (!surf || !surf.measurementType || surf.measurementType !== 'by-unit') {
        console.warn(`getUnits: Invalid surface at index ${index} for unitBased type "${type}"`, { surf, measurementType: surf?.measurementType });
        return sum;
      }
      const units = parseFloat(surf.units) || parseFloat(surf.sqft) || 0;
      if (isNaN(units) || units <= 0) {
        console.warn(`getUnits: Invalid or non-positive units/sqft at index ${index} for unitBased type "${type}"`, { surf, units });
        return sum;
      }
      return sum + units;
    }, 0);
    if (total === 0 && surfaces.length > 0) {
      console.debug(`getUnits: Zero units for unitBased item type "${type}"`, { item, surfaces });
    }
    return total;
  }

  console.warn(`getUnits: Type "${type}" not found in WORK_TYPES`, item);
  return 0;
}

// Get unit label for an item type
export function getUnitLabel(type) {
  if (!type) {
    console.warn('getUnitLabel: No type provided');
    return 'units';
  }
  if (!(type in MEASUREMENT_TYPES)) {
    console.warn(`getUnitLabel: Unknown type "${type}" not in MEASUREMENT_TYPES`);
    return 'units';
  }
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(type))) {
    return 'sqft';
  }
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(type))) {
    return 'linear ft';
  }
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(type))) {
    return 'units';
  }
  console.warn(`getUnitLabel: Type "${type}" not found in WORK_TYPES`);
  return 'units';
}