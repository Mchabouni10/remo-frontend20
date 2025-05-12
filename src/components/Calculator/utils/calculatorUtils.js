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

// Calculate total units for a work item
export function getUnits(item) {
  if (!item || !item.type) return 0;
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(item.type))) {
    return (item.surfaces || []).reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0);
  }
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(item.type))) {
    return parseFloat(item.linearFt) || 0;
  }
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(item.type))) {
    return parseFloat(item.units) || 0;
  }
  return 0;
}

// Get unit label for a work item
export function getUnitLabel(item) {
  if (!item || !item.type) return '';
  if (Object.values(WORK_TYPES).some(cat => cat.surfaceBased.includes(item.type))) return 'sqft';
  if (Object.values(WORK_TYPES).some(cat => cat.linearFtBased.includes(item.type))) return 'linear ft';
  if (Object.values(WORK_TYPES).some(cat => cat.unitBased.includes(item.type))) return 'units';
  return '';
}