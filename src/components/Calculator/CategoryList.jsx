// src/components/Calculator/CategoryList.jsx
import React from 'react';
import Category from './Category';
import styles from './Calculator.module.css';

export default function CategoryList({ categories, setCategories, newWorkName, setNewWorkName, settings, setSettings, disabled = false }) {
  const removeCategory = (catIndex) => {
    if (disabled) return;
    setCategories((prevCategories) => prevCategories.filter((_, i) => i !== catIndex));
  };

  const addWorkItem = (catIndex) => {
    if (disabled) return;
    const newWorkItem = {
      name: newWorkName.trim() || `Work Item ${categories[catIndex].workItems.length + 1}`,
      type: '',
      subtype: '',
      surfaces: [],
      linearFt: '',
      units: '',
      basePrice: '0.00',
      materialCost: undefined,
      laborCost: undefined,
      notes: '',
    };
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) =>
        i === catIndex ? { ...cat, workItems: [...cat.workItems, newWorkItem] } : cat
      )
    );
    setNewWorkName('');
  };

  const handleSettingsChange = (field, value) => {
    if (disabled) return;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleMiscFeeChange = (index, field, value) => {
    if (disabled) return;
    setSettings((prevSettings) => {
      const updatedMiscFees = prevSettings.miscFees.map((fee, i) =>
        i === index
          ? { ...fee, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : fee
      );
      return { ...prevSettings, miscFees: updatedMiscFees };
    });
  };

  const addMiscFee = () => {
    if (disabled) return;
    setSettings((prevSettings) => ({
      ...prevSettings,
      miscFees: [...prevSettings.miscFees, { name: `Fee ${prevSettings.miscFees.length + 1}`, amount: 0 }],
    }));
  };

  const removeMiscFee = (index) => {
    if (disabled) return;
    setSettings((prevSettings) => ({
      ...prevSettings,
      miscFees: prevSettings.miscFees.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className={styles.categories}>
      {categories.map((cat, catIndex) => (
        <Category
          key={catIndex}
          catIndex={catIndex}
          category={cat}
          setCategories={setCategories}
          removeCategory={removeCategory}
          addWorkItem={addWorkItem}
          newWorkName={newWorkName}
          setNewWorkName={setNewWorkName}
          disabled={disabled}
        />
      ))}
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsTitle}>Additional Costs</h3>
        <div className={styles.settingsField}>
          <label>Waste Factor (%):</label>
          <input
            type="number"
            value={settings.wasteFactor * 100}
            onChange={(e) => handleSettingsChange('wasteFactor', e.target.value / 100)}
            className={styles.input}
            min="0"
            step="0.1"
            disabled={disabled}
          />
        </div>
        <div className={styles.settingsField}>
          <label>Transportation Fee ($):</label>
          <input
            type="number"
            value={settings.transportationFee}
            onChange={(e) => handleSettingsChange('transportationFee', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </div>
        <div className={styles.settingsField}>
          <label>Tax Rate (%):</label>
          <input
            type="number"
            value={settings.taxRate * 100}
            onChange={(e) => handleSettingsChange('taxRate', e.target.value / 100)}
            className={styles.input}
            min="0"
            step="0.1"
            disabled={disabled}
          />
        </div>
        <div className={styles.miscFeesSection}>
          <label>Miscellaneous Fees:</label>
          {settings.miscFees.map((fee, index) => (
            <div key={index} className={styles.miscFeeRow}>
              <input
                type="text"
                value={fee.name}
                onChange={(e) => handleMiscFeeChange(index, 'name', e.target.value)}
                className={styles.input}
                placeholder="Fee Name"
                disabled={disabled}
              />
              <input
                type="number"
                value={fee.amount}
                onChange={(e) => handleMiscFeeChange(index, 'amount', e.target.value)}
                className={styles.input}
                min="0"
                disabled={disabled}
              />
              {!disabled && (
                <button
                  onClick={() => removeMiscFee(index)}
                  className={styles.removeMiscFeeButton}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <button onClick={addMiscFee} className={styles.addMiscFeeButton}>
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}