// src/components/Calculator/CategoryList.jsx
import React from 'react';
import WorkItem from './WorkItem/WorkItem'; // Assuming WorkItem exists instead of Category
import { calculateTotal } from './calculatorFunctions'; // Importing for totals
import styles from './Calculator.module.css';

export default function CategoryList({ 
  categories, 
  setCategories, 
  newWorkName, 
  setNewWorkName, 
  settings, 
  setSettings, 
  disabled = false 
}) {
  const [useManualMarkup, setUseManualMarkup] = React.useState(false);

  // Calculate totals using the imported function
  const totals = calculateTotal(
    categories || [],
    settings?.taxRate || 0,
    settings?.transportationFee || 0,
    settings?.wasteFactor || 0,
    settings?.miscFees || [],
    settings?.markup || 0
  );

  // Adjusted grand total after deposit
  const adjustedGrandTotal = Math.max(0, totals.total - (settings?.deposit || 0));

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
      materialCost: '0.00',
      laborCost: '0.00',
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
        <div key={catIndex} className={styles.category}>
          <div className={styles.categoryHeader}>
            <input
              value={cat.name}
              onChange={(e) => {
                if (disabled) return;
                setCategories((prev) =>
                  prev.map((c, i) => (i === catIndex ? { ...c, name: e.target.value } : c))
                );
              }}
              className={styles.categoryName}
              disabled={disabled}
            />
            {!disabled && (
              <button
                onClick={() => removeCategory(catIndex)}
                className={styles.removeCategoryButton}
              >
                × Remove Category
              </button>
            )}
          </div>

          {cat.workItems.map((workItem, workIndex) => (
            <WorkItem
              key={workIndex}
              catIndex={catIndex}
              workIndex={workIndex}
              workItem={workItem}
              setCategories={setCategories}
              disabled={disabled}
            />
          ))}

          {!disabled && (
            <div className={styles.workControls}>
              <input
                value={newWorkName}
                onChange={(e) => setNewWorkName(e.target.value)}
                placeholder="New work name"
                className={styles.newWorkInput}
              />
              <button
                onClick={() => addWorkItem(catIndex)}
                className={styles.addWorkButton}
              >
                + Add Work Item
              </button>
            </div>
          )}
        </div>
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
        <div className={styles.settingsField}>
          <label>Markup (%):</label>
          {useManualMarkup ? (
            <input
              type="number"
              value={settings.markup * 100}
              onChange={(e) => handleSettingsChange('markup', e.target.value / 100)}
              className={styles.input}
              min="0"
              step="0.1"
              disabled={disabled}
            />
          ) : (
            <select
              value={settings.markup * 100}
              onChange={(e) => handleSettingsChange('markup', e.target.value / 100)}
              className={styles.input}
              disabled={disabled}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((val) => (
                <option key={val} value={val}>{val}%</option>
              ))}
            </select>
          )}
          {!disabled && (
            <label>
              <input
                type="checkbox"
                checked={useManualMarkup}
                onChange={() => setUseManualMarkup(!useManualMarkup)}
              />
              Manual
            </label>
          )}
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
              + Add Fee
            </button>
          )}
        </div>

        <h3 className={styles.settingsTitle}>Payment Tracking</h3>
        <div className={styles.settingsField}>
          <label>Deposit/Down Payment ($):</label>
          <input
            type="number"
            value={settings.deposit}
            onChange={(e) => handleSettingsChange('deposit', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </div>
        <div className={styles.settingsField}>
          <label>Amount Paid ($):</label>
          <input
            type="number"
            value={settings.amountPaid}
            onChange={(e) => handleSettingsChange('amountPaid', e.target.value)}
            className={styles.input}
            min="0"
            disabled={disabled}
          />
        </div>

        {/* Simplified Totals Display */}
        <div className={styles.totalsSection}>
          <h4 className={styles.subSectionTitle}>Summary</h4>
          <table className={styles.breakdownTable}>
            <tbody>
              <tr>
                <td>Total Before Deposit:</td>
                <td>${totals.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Adjusted Total (After Deposit):</td>
                <td>${adjustedGrandTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Amount Remaining:</td>
                <td>
                  ${Math.max(0, adjustedGrandTotal - (settings?.amountPaid || 0)).toFixed(2)}
                  {settings?.amountPaid > adjustedGrandTotal && (
                    <span className={styles.overpaid}> (Overpaid by ${(settings.amountPaid - adjustedGrandTotal).toFixed(2)})</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}