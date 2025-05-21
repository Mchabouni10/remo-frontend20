// src/components/Calculator/Calculator.jsx
import React, { useState } from 'react';
import CategoryList from './Category/CategoryList';
import LaborPricingSheet from './LaborPricingSheet/LaborPricingSheet';
import CostSummary from './Category/CostSummary';
import PaymentTracking from './Category/PaymentTracking';
import styles from './Calculator.module.css';

export default function Calculator({ categories, setCategories, settings, setSettings, disabled = false }) {
  const [showLaborPricing, setShowLaborPricing] = useState(false);

  const removeCategory = (index) => {
    if (disabled) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleLaborPricing = () => {
    setShowLaborPricing((prev) => !prev);
  };

  // Debug logging
  console.log('Calculator - Categories:', JSON.stringify(categories, null, 2));
  console.log('Calculator - Settings:', JSON.stringify(settings, null, 2));

  return (
    <div className={styles.calculator}>
      <div className={styles.header}>
        <h2 className={styles.title}>Remodeling Calculator</h2>
        <button
          className={`${styles.pricingButton} button button--secondary`}
          onClick={toggleLaborPricing}
          title={showLaborPricing ? 'Hide Labor Pricing Guide' : 'Show Labor Pricing Guide'}
        >
          <i className="fas fa-dollar-sign"></i>
          {showLaborPricing ? 'Hide Pricing Guide' : 'View Pricing Guide'}
        </button>
      </div>
      {showLaborPricing && <LaborPricingSheet />}
      <CategoryList
        categories={categories}
        setCategories={setCategories}
        settings={settings}
        setSettings={setSettings}
        disabled={disabled}
        removeCategory={removeCategory}
      />
      <CostSummary categories={categories} settings={settings} />
      <PaymentTracking
        categories={categories}
        settings={settings}
        setSettings={setSettings}
        disabled={disabled}
      />
    </div>
  );
}