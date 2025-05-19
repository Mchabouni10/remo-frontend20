// src/components/calculator/calculations/costCalculations.js
// src/components/calculator/calculations/costCalculations.js
import { getUnits } from '../utils/calculatorUtils';

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
      if (!item.type) {
        console.warn(`calculateTotal: Skipping item at category ${index}, item ${itemIndex} with no type`, item);
        return;
      }

      const units = getUnits(item) || 0;
      const itemMaterialCost = parseFloat(item.materialCost) || 0;
      const itemLaborCost = parseFloat(item.laborCost) || 0;

      // Only include costs if units are non-zero or item has valid surfaces
      if (itemMaterialCost > 0 && units > 0) {
        materialCost += itemMaterialCost * units;
      }
      if (itemLaborCost > 0 && units > 0) {
        laborCost += itemLaborCost * units;
      }

      if (units === 0 && (itemMaterialCost > 0 || itemLaborCost > 0) && item.surfaces?.length > 0) {
        console.debug(
          `calculateTotal: Item at category ${index}, item ${itemIndex} has zero units but non-zero costs`,
          { name: item.name, type: item.type, measurementType: item.surfaces[0]?.measurementType, surfaces: item.surfaces }
        );
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