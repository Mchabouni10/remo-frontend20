// src/components/Calculator/calculatorFunctions.js
export const WORK_TYPES = {
  surfaceBased: [
    'kitchen-flooring', 'kitchen-tiles', 'kitchen-backsplash',
    'bathroom-flooring', 'bathroom-tiles', 'bathroom-shower-tiles',
    'living-room-flooring', 'bedroom-flooring', 'exterior-deck',
    'general-drywall', 'general-painting'
  ],
  linearFtBased: [
    'kitchen-cabinets', 'bathroom-vanity', 'general-trim',
    'general-crown-molding', 'general-baseboards'
  ],
  unitBased: [
    'kitchen-sink', 'kitchen-faucet', 'kitchen-lighting',
    'bathroom-faucet', 'bathroom-shower-faucet', 'bathroom-fan',
    'bathroom-towel-warmer', 'living-room-lighting',
    'bedroom-lighting', 'general-lighting', 'general-doors',
    'general-windows'
  ]
};

export const SUBTYPE_OPTIONS = {
  'kitchen-flooring': ['hardwood', 'laminate', 'vinyl', 'tile'],
  'kitchen-tiles': ['ceramic', 'porcelain', 'mosaic'],
  'kitchen-backsplash': ['subway', 'glass', 'stone'],
  'kitchen-cabinets': ['standard', 'custom'],
  'kitchen-sink': ['stainless', 'composite'],
  'kitchen-faucet': ['single-handle', 'double-handle'],
  'kitchen-lighting': ['pendant', 'recessed'],
  'bathroom-flooring': ['tile', 'vinyl'],
  'bathroom-tiles': ['ceramic', 'porcelain'],
  'bathroom-shower-tiles': ['porcelain', 'glass'],
  'bathroom-vanity': ['single-sink', 'double-sink'],
  'bathroom-faucet': ['single-handle', 'widespread'],
  'bathroom-shower-faucet': ['rain', 'handheld'],
  'bathroom-fan': ['standard', 'quiet'],
  'bathroom-towel-warmer': ['wall-mounted', 'freestanding'],
  'living-room-flooring': ['hardwood', 'carpet'],
  'living-room-lighting': ['chandelier', 'recessed'],
  'bedroom-flooring': ['carpet', 'hardwood'],
  'bedroom-lighting': ['recessed', 'ceiling-fan'],
  'exterior-deck': ['wood', 'composite'],
  'general-drywall': ['standard', 'moisture-resistant'],
  'general-painting': ['interior', 'exterior'],
  'general-lighting': ['recessed', 'track'],
  'general-doors': ['interior', 'exterior'],
  'general-windows': ['double-hung', 'casement'],
  'general-trim': ['standard', 'decorative'],
  'general-crown-molding': ['simple', 'ornate'],
  'general-baseboards': ['standard', 'tall']
};

export const DEFAULT_SUBTYPES = {
  'kitchen-flooring': 'hardwood',
  'kitchen-tiles': 'ceramic',
  'kitchen-backsplash': 'subway',
  // Add more as needed
};

export function calculateWorkCost(item) {
  const materialCostPerUnit = parseFloat(item.materialCost) || 0;
  const laborCostPerUnit = parseFloat(item.laborCost) || 0;

  let totalUnits = 0;
  if (WORK_TYPES.surfaceBased.includes(item.type)) {
    totalUnits = (item.surfaces || []).reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0);
  } else if (WORK_TYPES.linearFtBased.includes(item.type)) {
    totalUnits = parseFloat(item.linearFt) || 0;
  } else if (WORK_TYPES.unitBased.includes(item.type)) {
    totalUnits = parseFloat(item.units) || 0;
  }

  return (materialCostPerUnit + laborCostPerUnit) * totalUnits;
}

export function calculateTotal(categories = [], taxRate = 0, transportationFee = 0, wasteFactor = 0, miscFees = [], markup = 0) {
  let materialCost = 0;
  let laborCost = 0;

  (categories || []).forEach((cat) => {
    (cat.workItems || []).forEach((item) => {
      const units = WORK_TYPES.surfaceBased.includes(item.type)
        ? (item.surfaces || []).reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0)
        : WORK_TYPES.linearFtBased.includes(item.type)
        ? parseFloat(item.linearFt) || 0
        : parseFloat(item.units) || 0;
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
    total: subtotal + wasteCost + transportationFeeTotal + tax + miscTotal + markupCost
  };
}


