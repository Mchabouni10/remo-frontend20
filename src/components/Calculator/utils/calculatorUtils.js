//src/components/Calculator/utils/calculatorUtils.js
import { WORK_TYPES, MEASUREMENT_TYPES } from '../data/workTypes';

// Helper function to get all work types as a flat array
export const getAllWorkTypes = () => {
  const allTypes = [];
  Object.values(WORK_TYPES).forEach((category) => {
    allTypes.push(...category.surfaceBased, ...category.linearFtBased, ...category.unitBased);
  });
  return [...new Set(allTypes)]; // Ensure unique types
};

// Infer type from name if missing
export const inferTypeFromName = (name) => {
  if (!name || typeof name !== 'string') {
    console.warn('inferTypeFromName: Invalid or missing name', name);
    return null;
  }
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
  const allTypes = getAllWorkTypes();

  // Check exact match
  if (allTypes.includes(normalizedName)) {
    console.debug(`inferTypeFromName: Matched type "${normalizedName}" for name "${name}"`);
    return normalizedName;
  }

  // Keyword-based matching
  if (/install|installation|outlet|switch|fixture|fan|detector|breaker|doorbell|charger|plug/i.test(name)) {
    const type = 'electrical-light-fixture-installation'; // Default to a common electrical type
    console.debug(`inferTypeFromName: Inferred type "${type}" for name "${name}" (electrical match)`);
    return type;
  }
  if (/paint|painting|wall|ceiling|drywall/i.test(name)) {
    const type = 'general-painting';
    console.debug(`inferTypeFromName: Inferred type "${type}" for name "${name}" (painting match)`);
    return type;
  }
  if (/floor|flooring|tile|carpet|hardwood|vinyl/i.test(name)) {
    const type = 'general-flooring';
    console.debug(`inferTypeFromName: Inferred type "${type}" for name "${name}" (flooring match)`);
    return type;
  }
  if (/kitchen|countertop|sink|faucet|cabinet/i.test(name)) {
    const type = 'kitchen-flooring';
    console.debug(`inferTypeFromName: Inferred type "${type}" for name "${name}" (kitchen match)`);
    return type;
  }
  if (/bathroom|shower|toilet|vanity|bathtub/i.test(name)) {
    const type = 'bathroom-flooring';
    console.debug(`inferTypeFromName: Inferred type "${type}" for name "${name}" (bathroom match)`);
    return type;
  }

  console.warn(`inferTypeFromName: Could not infer valid type for name "${name}", returning null`);
  return null;
};

// Calculate total units for a work item
export function getUnits(item) {
  if (!item || typeof item !== 'object') {
    console.warn('getUnits: Invalid item', item);
    return 0;
  }
  let type = item.type;
  if (!type && item.name) {
    type = inferTypeFromName(item.name);
    if (type) {
      console.debug(`getUnits: Inferred type "${type}" from name "${item.name}"`);
    }
  }
  if (!type) {
    console.warn('getUnits: No valid type or name provided', item);
    return 0;
  }
  const measurementType = MEASUREMENT_TYPES[type] || 'single-surface';
  if (!(type in MEASUREMENT_TYPES)) {
    console.warn(`getUnits: Type "${type}" not found in MEASUREMENT_TYPES, defaulting to "${measurementType}"`);
  }

  const surfaces = Array.isArray(item.surfaces) ? item.surfaces : [];
  if (surfaces.length === 0) {
    console.debug(`getUnits: No surfaces for type "${type}" with measurementType "${measurementType}"`, item);
    return 0;
  }

  const total = surfaces.reduce((sum, surf, index) => {
    if (!surf || !surf.measurementType) {
      console.warn(`getUnits: Invalid surface at index ${index} for type "${type}"`, surf);
      return sum;
    }
    if (surf.measurementType !== measurementType) {
      console.warn(`getUnits: Surface measurementType "${surf.measurementType}" does not match item measurementType "${measurementType}" at index ${index}`, surf);
    }
    let qty = 0;
    if (measurementType === 'single-surface' || measurementType === 'room-surface') {
      qty = parseFloat(surf.sqft) || 0;
      if (isNaN(qty)) {
        console.warn(`getUnits: Invalid sqft at index ${index} for type "${type}"`, surf);
        return sum;
      }
    } else if (measurementType === 'linear-foot') {
      qty = parseFloat(surf.linearFt) || 0;
      if (isNaN(qty)) {
        console.warn(`getUnits: Invalid linearFt at index ${index} for type "${type}"`, surf);
        return sum;
      }
    } else if (measurementType === 'by-unit') {
      qty = parseFloat(surf.units) || 0;
      if (isNaN(qty)) {
        console.warn(`getUnits: Invalid units at index ${index} for type "${type}"`, surf);
        return sum;
      }
    }
    return sum + qty;
  }, 0);

  if (total === 0) {
    console.debug(`getUnits: Zero units for type "${type}" with measurementType "${measurementType}"`, item);
  }
  return total;
}

// Get unit label for a work item
export function getUnitLabel(item) {
  if (!item || typeof item !== 'object') {
    console.warn('getUnitLabel: Invalid item', item);
    return 'unit';
  }
  let type = item.type;
  if (!type && item.name) {
    type = inferTypeFromName(item.name);
    if (type) {
      console.debug(`getUnitLabel: Inferred type "${type}" from name "${item.name}"`);
    }
  }
  if (!type) {
    console.warn('getUnitLabel: No valid type or name provided', item);
    return 'unit';
  }
  const measurementType = MEASUREMENT_TYPES[type] || 'single-surface';
  if (!(type in MEASUREMENT_TYPES)) {
    console.warn(`getUnitLabel: Type "${type}" not found in MEASUREMENT_TYPES, defaulting to "${measurementType}"`);
  }
  switch (measurementType) {
    case 'single-surface':
    case 'room-surface':
      return 'sqft';
    case 'linear-foot':
      return 'linear ft';
    case 'by-unit':
      return 'units';
    default:
      console.warn(`getUnitLabel: Unknown measurementType "${measurementType}" for type "${type}", defaulting to "unit"`);
      return 'unit';
  }
}