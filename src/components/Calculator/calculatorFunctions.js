// src/components/Calculator/calculatorFunctions.js
export const WORK_TYPES = {
  kitchen: {
    surfaceBased: [
      'kitchen-flooring',
      'kitchen-tiles',
      'kitchen-backsplash',
    ],
    linearFtBased: [
      'kitchen-cabinets',
      'kitchen-countertops',
      'kitchen-trim',
    ],
    unitBased: [
      'kitchen-sink',
      'kitchen-faucet',
      'kitchen-lighting',
      'kitchen-appliance',
      'kitchen-hood',
    ],
  },
  bathroom: {
    surfaceBased: [
      'bathroom-flooring',
      'bathroom-tiles',
      'bathroom-shower-tiles',
      'bathroom-walls',
    ],
    linearFtBased: [
      'bathroom-vanity',
      'bathroom-trim',
      'bathroom-shower-ledge',
    ],
    unitBased: [
      'bathroom-faucet',
      'bathroom-shower-faucet',
      'bathroom-fan',
      'bathroom-towel-warmer',
      'bathroom-toilet',
      'bathroom-mirror',
      'bathroom-lighting',
    ],
  },
  livingRoom: {
    surfaceBased: [
      'living-room-flooring',
      'living-room-walls',
    ],
    linearFtBased: [
      'living-room-trim',
      'living-room-crown-molding',
    ],
    unitBased: [
      'living-room-lighting',
      'living-room-fireplace',
      'living-room-ceiling-fan',
    ],
  },
  bedroom: {
    surfaceBased: [
      'bedroom-flooring',
      'bedroom-walls',
    ],
    linearFtBased: [
      'bedroom-trim',
      'bedroom-closet-shelves',
    ],
    unitBased: [
      'bedroom-lighting',
      'bedroom-ceiling-fan',
      'bedroom-window',
    ],
  },
  exterior: {
    surfaceBased: [
      'exterior-deck',
      'exterior-siding',
      'exterior-painting',
    ],
    linearFtBased: [
      'exterior-fencing',
      'exterior-trim',
    ],
    unitBased: [
      'exterior-door',
      'exterior-window',
      'exterior-lighting',
    ],
  },
  general: {
    surfaceBased: [
      'general-drywall',
      'general-painting',
      'general-flooring',
    ],
    linearFtBased: [
      'general-trim',
      'general-crown-molding',
      'general-baseboards',
      'general-handrail',
    ],
    unitBased: [
      'general-lighting',
      'general-doors',
      'general-windows',
      'general-ceiling-fan',
      'general-smoke-detector',
    ],
  },
};

export const SUBTYPE_OPTIONS = {
  // Kitchen
  'kitchen-flooring': ['hardwood', 'laminate', 'vinyl', 'tile', 'stone'],
  'kitchen-tiles': ['ceramic', 'porcelain', 'mosaic', 'glass'],
  'kitchen-backsplash': ['subway', 'glass', 'stone', 'metal'],
  'kitchen-cabinets': ['standard', 'custom', 'semi-custom'],
  'kitchen-countertops': ['granite', 'quartz', 'laminate', 'butcher-block'],
  'kitchen-trim': ['standard', 'decorative'],
  'kitchen-sink': ['stainless', 'composite', 'cast-iron'],
  'kitchen-faucet': ['single-handle', 'double-handle', 'touchless'],
  'kitchen-lighting': ['pendant', 'recessed', 'under-cabinet'],
  'kitchen-appliance': ['refrigerator', 'oven', 'microwave', 'dishwasher'],
  'kitchen-hood': ['wall-mounted', 'island', 'under-cabinet'],

  // Bathroom
  'bathroom-flooring': ['tile', 'vinyl', 'stone'],
  'bathroom-tiles': ['ceramic', 'porcelain', 'stone'],
  'bathroom-shower-tiles': ['porcelain', 'glass', 'mosaic'],
  'bathroom-walls': ['paint', 'tile', 'wallpaper'],
  'bathroom-vanity': ['single-sink', 'double-sink', 'custom'],
  'bathroom-trim': ['standard', 'decorative'],
  'bathroom-shower-ledge': ['marble', 'quartz', 'tile'],
  'bathroom-faucet': ['single-handle', 'widespread', 'wall-mounted'],
  'bathroom-shower-faucet': ['rain', 'handheld', 'multi-head'],
  'bathroom-fan': ['standard', 'quiet', 'with-light'],
  'bathroom-towel-warmer': ['wall-mounted', 'freestanding'],
  'bathroom-toilet': ['one-piece', 'two-piece', 'smart'],
  'bathroom-mirror': ['framed', 'frameless', 'lighted'],
  'bathroom-lighting': ['vanity', 'recessed', 'sconce'],

  // Living Room
  'living-room-flooring': ['hardwood', 'carpet', 'tile'],
  'living-room-walls': ['paint', 'wallpaper', 'paneling'],
  'living-room-trim': ['standard', 'decorative'],
  'living-room-crown-molding': ['simple', 'ornate'],
  'living-room-lighting': ['chandelier', 'recessed', 'floor-lamp'],
  'living-room-fireplace': ['wood-burning', 'gas', 'electric'],
  'living-room-ceiling-fan': ['standard', 'with-light', 'smart'],

  // Bedroom
  'bedroom-flooring': ['carpet', 'hardwood', 'laminate'],
  'bedroom-walls': ['paint', 'wallpaper', 'paneling'],
  'bedroom-trim': ['standard', 'decorative'],
  'bedroom-closet-shelves': ['wire', 'wood', 'custom'],
  'bedroom-lighting': ['recessed', 'ceiling-fan', 'table-lamp'],
  'bedroom-ceiling-fan': ['standard', 'with-light', 'smart'],
  'bedroom-window': ['double-hung', 'casement', 'sliding'],

  // Exterior
  'exterior-deck': ['wood', 'composite', 'pvc'],
  'exterior-siding': ['vinyl', 'brick', 'fiber-cement'],
  'exterior-painting': ['latex', 'oil-based', 'stain'],
  'exterior-fencing': ['wood', 'vinyl', 'chain-link'],
  'exterior-trim': ['standard', 'decorative'],
  'exterior-door': ['steel', 'fiberglass', 'wood'],
  'exterior-window': ['double-hung', 'casement', 'picture'],
  'exterior-lighting': ['wall-mounted', 'post', 'flood'],

  // General
  'general-drywall': ['standard', 'moisture-resistant', 'fire-rated'],
  'general-painting': ['interior', 'exterior', 'specialty'],
  'general-flooring': ['hardwood', 'tile', 'carpet'],
  'general-trim': ['standard', 'decorative', 'pvc'],
  'general-crown-molding': ['simple', 'ornate', 'foam'],
  'general-baseboards': ['standard', 'tall', 'curved'],
  'general-handrail': ['wood', 'metal', 'glass'],
  'general-lighting': ['recessed', 'track', 'ceiling'],
  'general-doors': ['interior', 'exterior', 'sliding'],
  'general-windows': ['double-hung', 'casement', 'bay'],
  'general-ceiling-fan': ['standard', 'with-light', 'smart'],
  'general-smoke-detector': ['battery', 'hardwired', 'smart'],
};

export const DEFAULT_SUBTYPES = {
  'kitchen-flooring': 'hardwood',
  'kitchen-tiles': 'ceramic',
  'kitchen-backsplash': 'subway',
  'kitchen-cabinets': 'standard',
  'kitchen-countertops': 'granite',
  'kitchen-trim': 'standard',
  'kitchen-sink': 'stainless',
  'kitchen-faucet': 'single-handle',
  'kitchen-lighting': 'pendant',
  'kitchen-appliance': 'refrigerator',
  'kitchen-hood': 'wall-mounted',
  'bathroom-flooring': 'tile',
  'bathroom-tiles': 'ceramic',
  'bathroom-shower-tiles': 'porcelain',
  'bathroom-walls': 'paint',
  'bathroom-vanity': 'single-sink',
  'bathroom-trim': 'standard',
  'bathroom-shower-ledge': 'marble',
  'bathroom-faucet': 'single-handle',
  'bathroom-shower-faucet': 'rain',
  'bathroom-fan': 'standard',
  'bathroom-towel-warmer': 'wall-mounted',
  'bathroom-toilet': 'one-piece',
  'bathroom-mirror': 'framed',
  'bathroom-lighting': 'vanity',
  'living-room-flooring': 'hardwood',
  'living-room-walls': 'paint',
  'living-room-trim': 'standard',
  'living-room-crown-molding': 'simple',
  'living-room-lighting': 'chandelier',
  'living-room-fireplace': 'wood-burning',
  'living-room-ceiling-fan': 'standard',
  'bedroom-flooring': 'carpet',
  'bedroom-walls': 'paint',
  'bedroom-trim': 'standard',
  'bedroom-closet-shelves': 'wire',
  'bedroom-lighting': 'recessed',
  'bedroom-ceiling-fan': 'standard',
  'bedroom-window': 'double-hung',
  'exterior-deck': 'wood',
  'exterior-siding': 'vinyl',
  'exterior-painting': 'latex',
  'exterior-fencing': 'wood',
  'exterior-trim': 'standard',
  'exterior-door': 'steel',
  'exterior-window': 'double-hung',
  'exterior-lighting': 'wall-mounted',
  'general-drywall': 'standard',
  'general-painting': 'interior',
  'general-flooring': 'hardwood',
  'general-trim': 'standard',
  'general-crown-molding': 'simple',
  'general-baseboards': 'standard',
  'general-handrail': 'wood',
  'general-lighting': 'recessed',
  'general-doors': 'interior',
  'general-windows': 'double-hung',
  'general-ceiling-fan': 'standard',
  'general-smoke-detector': 'battery',
};

// Helper function to get all work types as a flat array for compatibility
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

// Calculate cost for a single work item
export function calculateWorkCost(item) {
  const materialCostPerUnit = parseFloat(item.materialCost) || 0;
  const laborCostPerUnit = parseFloat(item.laborCost) || 0;
  const totalUnits = getUnits(item); // Use getUnits for consistency
  return (materialCostPerUnit + laborCostPerUnit) * totalUnits;
}

// Calculate total cost for all categories
export function calculateTotal(categories = [], taxRate = 0, transportationFee = 0, wasteFactor = 0, miscFees = [], markup = 0) {
  let materialCost = 0;
  let laborCost = 0;

  (categories || []).forEach((cat) => {
    (cat.workItems || []).forEach((item) => {
      const units = getUnits(item); // Use getUnits for consistency
      materialCost += (parseFloat(item.materialCost) || 0) * units;
      laborCost += (parseFloat(item.laborCost) || 0) * units;
    });
  });

  const subtotal = materialCost + laborCost;
  const wasteCost = subtotal * (wasteFactor || 0);
  const transportationFeeTotal = parseFloat(transportationFee) || 0;
  const tax = subtotal * (taxRate || 0);
  const miscTotal = (miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  const markupCost = subtotal * (markup || 0);

  return {
    materialCost,
    laborCost,
    wasteCost,
    transportationFee: transportationFeeTotal,
    tax,
    markupCost,
    total: subtotal + wasteCost + transportationFeeTotal + tax + miscTotal + markupCost,
  };
}

