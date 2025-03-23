import React, { useState } from 'react';
import CategoryList from './CategoryList';
import { calculateTotal } from './calculatorFunctions';
import styles from './Calculator.module.css';

export default function Calculator({ categories, setCategories, settings, setSettings, disabled = false }) {
  const [newWorkName, setNewWorkName] = useState('');

  const totals = calculateTotal(categories, settings.taxRate, settings.transportationFee, settings.wasteFactor, settings.miscFees);

  const addCategory = () => {
    if (disabled) return;
    setCategories((prevCategories) => [
      ...prevCategories,
      { name: `Category ${prevCategories.length + 1}`, workItems: [] },
    ]);
  };

  const removeLastCategory = () => {
    if (disabled) return;
    setCategories((prevCategories) => prevCategories.slice(0, -1));
  };

  return (
    <div className={styles.calculator}>
      <h2 className={styles.title}>Remodeling Calculator</h2>
      {!disabled && (
        <div className={styles.categoryControls}>
          <button onClick={addCategory} className={styles.addCategoryButton}>
            + Add Category
          </button>
          {categories.length > 0 && (
            <button onClick={removeLastCategory} className={styles.removeCategoryButton}>
              × Remove Category
            </button>
          )}
        </div>
      )}
      <CategoryList
        categories={categories}
        setCategories={setCategories}
        newWorkName={newWorkName}
        setNewWorkName={setNewWorkName}
        settings={settings}
        setSettings={setSettings}
        disabled={disabled}
      />
      <div className={styles.totalsSection}>
        <h3>Cost Breakdown</h3>
        <p>Material Cost: ${totals.materialCost.toFixed(2)}</p>
        <p>Labor Cost: ${totals.laborCost.toFixed(2)}</p>
        <p>Waste Cost: ${totals.wasteCost.toFixed(2)}</p>
        <p>Transportation Fee: ${totals.transportationFee.toFixed(2)}</p>
        <p>Tax: ${totals.tax.toFixed(2)}</p>
        <p><strong>Total Cost: ${totals.total.toFixed(2)}</strong></p>
      </div>
    </div>
  );
}

