export function calculateWorkCost(item) {
    const isSurfaceBased = [
      'kitchen-flooring', 'kitchen-tiles', 'kitchen-backsplash',
      'bathroom-flooring', 'bathroom-tiles', 'bathroom-shower-tiles',
      'living-room-flooring', 'bedroom-flooring', 'exterior-deck',
      'general-drywall', 'general-painting'
    ].includes(item.type);
    const isLinearFtBased = [
      'kitchen-cabinets', 'bathroom-vanity', 'general-trim',
      'general-crown-molding', 'general-baseboards'
    ].includes(item.type);
    const isUnitBased = [
      'kitchen-sink', 'kitchen-faucet', 'kitchen-lighting',
      'bathroom-faucet', 'bathroom-shower-faucet', 'bathroom-fan',
      'bathroom-towel-warmer', 'living-room-lighting',
      'bedroom-lighting', 'general-lighting', 'general-doors',
      'general-windows'
    ].includes(item.type);
  
    const basePrice = item.basePrice || 0;
    const materialCostPerUnit = item.materialCost !== undefined ? item.materialCost : basePrice * 0.6;
    const laborCostPerUnit = item.laborCost !== undefined ? item.laborCost : basePrice * 0.4;
  
    let totalUnits = 0;
    if (isSurfaceBased) {
      totalUnits = item.surfaces.reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0);
    } else if (isLinearFtBased) {
      totalUnits = parseFloat(item.linearFt) || 0;
    } else if (isUnitBased) {
      totalUnits = parseFloat(item.units) || 0;
    }
  
    const materialCost = materialCostPerUnit * totalUnits;
    const laborCost = laborCostPerUnit * totalUnits;
  
    return materialCost + laborCost;
  }
  
  export function calculateTotal(categories, taxRate, transportationFee, wasteFactor, miscFees) {
    let materialCost = 0;
    let laborCost = 0;
  
    categories.forEach((cat) => {
      cat.workItems.forEach((item) => {
        const cost = calculateWorkCost(item);
        const materialPortion = item.materialCost !== undefined ? item.materialCost : (item.basePrice || 0) * 0.6;
        const laborPortion = item.laborCost !== undefined ? item.laborCost : (item.basePrice || 0) * 0.4;
        const totalUnits = [
          'kitchen-flooring', 'kitchen-tiles', 'kitchen-backsplash',
          'bathroom-flooring', 'bathroom-tiles', 'bathroom-shower-tiles',
          'living-room-flooring', 'bedroom-flooring', 'exterior-deck',
          'general-drywall', 'general-painting'
        ].includes(item.type)
          ? item.surfaces.reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0)
          : ['kitchen-cabinets', 'bathroom-vanity', 'general-trim', 'general-crown-molding', 'general-baseboards'].includes(item.type)
          ? parseFloat(item.linearFt) || 0
          : parseFloat(item.units) || 0;
        materialCost += materialPortion * totalUnits;
        laborCost += laborPortion * totalUnits;
      });
    });
  
    const subtotal = materialCost + laborCost;
    const wasteCost = subtotal * (wasteFactor || 0);
    const transportationFeeTotal = parseFloat(transportationFee) || 0;
    const tax = subtotal * (taxRate || 0);
    const miscTotal = miscFees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    const total = subtotal + wasteCost + transportationFeeTotal + tax + miscTotal;
  
    return { materialCost, laborCost, wasteCost, transportationFee: transportationFeeTotal, tax, total };
  }