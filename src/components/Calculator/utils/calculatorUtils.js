//src/components/Calculator/utils/calculatorUtils.js

import { WORK_TYPES } from '../data/workTypes';

// Helper function to get all work types as a flat array
export const getAllWorkTypes = () => {
  const allTypes = [];
  Object.values(WORK_TYPES).forEach((category) => {
    allTypes.push(...category.surfaceBased, ...category.linearFtBased, ...category.unitBased);
  });
  return allTypes;
};

// Infer type from name if missing
const inferTypeFromName = (name) => {
  if (!name) return null;
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
  if (/installation/i.test(name)) return 'outlet-installation'; // Adjust based on WORK_TYPES
  return normalizedName;
};

// Calculate total units for a work item
export function getUnits(item) {
  if (!item) {
    console.warn('getUnits: Invalid item', item);
    return 0;
  }
  let type = item.type;
  if (!type && item.name) {
    type = inferTypeFromName(item.name);
    console.warn(`getUnits: Missing item.type, inferred from name: ${type}`, item);
  }
  if (!type) {
    console.warn('getUnits: No type or name provided', item);
    return 0;
  }
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(type))) {
    const total = (item.surfaces || []).reduce((sum, surf, index) => {
      if (!surf || isNaN(parseFloat(surf.sqft))) {
        console.warn(`getUnits: Invalid surface at index ${index} for surfaceBased type`, surf);
        return sum;
      }
      return sum + (parseFloat(surf.sqft) || 0);
    }, 0);
    if (total === 0) console.warn(`getUnits: Zero units for surfaceBased item`, item);
    return total;
  }
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(type))) {
    const total = (item.surfaces || []).reduce((sum, surf, index) => {
      if (!surf || isNaN(parseFloat(surf.linearFt))) {
        console.warn(`getUnits: Invalid linearFt at index ${index} for linearFtBased type`, surf);
        return sum;
      }
      return sum + (parseFloat(surf.linearFt) || 0);
    }, 0);
    if (total === 0) console.warn(`getUnits: Zero units for linearFtBased item`, item);
    return total;
  }
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(type))) {
    const total = (item.surfaces || []).reduce((sum, surf, index) => {
      if (!surf) {
        console.warn(`getUnits: Invalid surface at index ${index} for unitBased type`, surf);
        return sum;
      }
      // Prefer surf.units, fallback to surf.sqft for unitBased
      const units = parseFloat(surf.units) || parseFloat(surf.sqft) || 0;
      if (isNaN(units)) {
        console.warn(`getUnits: Invalid units/sqft at index ${index} for unitBased type`, surf);
        return sum;
      }
      return sum + units;
    }, 0);
    if (total === 0) console.warn(`getUnits: Zero units for unitBased item`, item);
    return total;
  }
  console.warn(`getUnits: Unknown type ${type}`, item);
  return 0;
}

// Get unit label for a work item
export function getUnitLabel(item) {
  if (!item) return 'unit';
  let type = item.type;
  if (!type && item.name) {
    type = inferTypeFromName(item.name);
  }
  if (!type) return 'unit';
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(type))) return 'sqft';
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(type))) return 'linear ft';
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(type))) return 'units';
  return 'unit';
}