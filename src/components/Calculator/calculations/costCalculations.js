//src/components/calculator/calculations/costCalculations.js

import { getUnits } from '../utils/calculatorUtils';

// Calculate cost for a single work item
export function calculateWorkCost(item) {
  const materialCostPerUnit = parseFloat(item.materialCost) || 0;
  const laborCostPerUnit = parseFloat(item.laborCost) || 0;
  const totalUnits = getUnits(item);
  return (materialCostPerUnit + laborCostPerUnit) * totalUnits;
}

// Calculate total cost for all categories
export function calculateTotal(categories = [], taxRate = 0, transportationFee = 0, wasteFactor = 0, miscFees = [], markup = 0, laborDiscount = 0) {
  let materialCost = 0;
  let laborCost = 0;

  (categories || []).forEach((cat) => {
    (cat.workItems || []).forEach((item) => {
      const units = getUnits(item);
      materialCost += (parseFloat(item.materialCost) || 0) * units;
      laborCost += (parseFloat(item.laborCost) || 0) * units;
    });
  });

  // Apply labor discount
  const discountedLaborCost = laborCost * (1 - (laborDiscount || 0));

  const subtotal = materialCost + discountedLaborCost;
  const wasteCost = subtotal * (wasteFactor || 0);
  const transportationFeeTotal = parseFloat(transportationFee) || 0;
  const tax = subtotal * (taxRate || 0);
  const miscTotal = (miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
  const markupCost = subtotal * (markup || 0);

  return {
    materialCost,
    laborCost: discountedLaborCost, // Reflect discounted labor cost
    wasteCost,
    transportationFee: transportationFeeTotal,
    tax,
    markupCost,
    laborDiscount: laborCost - discountedLaborCost, // Amount discounted
    total: subtotal + wasteCost + transportationFeeTotal + tax + miscTotal + markupCost,
  };
}