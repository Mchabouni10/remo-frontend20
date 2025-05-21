// src/components/calculator/calculations/costCalculations.js
import { getUnits, getUnitLabel } from '../utils/calculatorUtils';
import { MEASUREMENT_TYPES } from '../data/workTypes';

export function calculateWorkCost(item) {
  if (!item || typeof item !== 'object' || !item.type) {
    console.warn('calculateWorkCost: Invalid or missing item', item);
    return 0;
  }
  const measurementType = MEASUREMENT_TYPES[item.type] || 'single-surface';
  const materialCostPerUnit = parseFloat(item.materialCost) || 0;
  const laborCostPerUnit = parseFloat(item.laborCost) || 0;
  const totalUnits = getUnits(item);
  if (totalUnits === 0) {
    console.debug(`calculateWorkCost: Zero units for item type "${item.type}" with measurementType "${measurementType}"`, item);
  }
  const cost = (materialCostPerUnit + laborCostPerUnit) * totalUnits;
  console.debug(`calculateWorkCost: Type "${item.type}", Units: ${totalUnits} ${getUnitLabel(item)}, Cost: $${cost.toFixed(2)}`);
  return cost;
}

export function calculateTotal(categories = [], taxRate = 0, transportationFee = 0, wasteFactor = 0, miscFees = [], markup = 0, laborDiscount = 0) {
  if (!Array.isArray(categories)) {
    console.warn('calculateTotal: categories is not an array', categories);
    categories = [];
  }

  let materialCost = 0;
  let laborCost = 0;

  categories.forEach((cat, index) => {
    if (!cat.workItems || !Array.isArray(cat.workItems)) {
      console.warn(`calculateTotal: category at index ${index} has no valid workItems`, cat);
      return;
    }
    cat.workItems.forEach((item, itemIndex) => {
      if (!item || !item.type) {
        console.warn(`calculateTotal: Invalid item at category ${index}, item ${itemIndex}`, item);
        return;
      }
      const measurementType = MEASUREMENT_TYPES[item.type] || 'single-surface';
      const units = getUnits(item) || 0;
      const itemMaterialCost = parseFloat(item.materialCost) || 0;
      const itemLaborCost = parseFloat(item.laborCost) || 0;
      materialCost += itemMaterialCost * units;
      laborCost += itemLaborCost * units;
      if (units === 0) {
        console.warn(`calculateTotal: Zero units for item at category ${index}, item ${itemIndex}, type "${item.type}", measurementType "${measurementType}"`, item);
      }
    });
  });

  const discountedLaborCost = laborCost * (1 - (parseFloat(laborDiscount) || 0));
  const subtotal = materialCost + discountedLaborCost;
  const wasteCost = subtotal * (parseFloat(wasteFactor) || 0);
  const transportationFeeTotal = parseFloat(transportationFee) || 0;
  const tax = subtotal * (parseFloat(taxRate) || 0);
  const miscTotal = Array.isArray(miscFees)
    ? miscFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0)
    : 0;
  const markupCost = subtotal * (parseFloat(markup) || 0);

  const total = subtotal + wasteCost + transportationFeeTotal + tax + miscTotal + markupCost;

  return {
    materialCost,
    laborCost: discountedLaborCost,
    wasteCost,
    transportationFee: transportationFeeTotal,
    tax,
    markupCost,
    laborDiscount: laborCost - discountedLaborCost,
    miscFeesTotal: miscTotal,
    total,
  };
}