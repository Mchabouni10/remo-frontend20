import React, { useState, useMemo } from 'react';
import styles from './CategoryList.module.css';
import WorkItem from '../WorkItem/WorkItem';
import { calculateTotal } from '../calculatorFunctions';

export default function CategoryList({
  categories = [],
  setCategories,
  settings = {},
  setSettings,
  disabled = false,
}) {
  const [newWorkName, setNewWorkName] = useState('');
  const [useManualMarkup, setUseManualMarkup] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['categories']));

  const totals = useMemo(
    () =>
      calculateTotal(
        categories,
        settings.taxRate || 0,
        settings.transportationFee || 0,
        settings.wasteFactor || 0,
        settings.miscFees || [],
        settings.markup || 0
      ),
    [settings, categories]
  );

  const adjustedGrandTotal = Math.max(0, totals.total - (settings.deposit || 0));
  const overpayment = settings.amountPaid > adjustedGrandTotal ? settings.amountPaid - adjustedGrandTotal : 0;

  const updateCategoryName = (catIndex, value) => {
    if (disabled) return;
    setCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, name: value } : cat))
    );
  };

  const removeCategory = (catIndex) => {
    if (disabled) return;
    setCategories((prev) => prev.filter((_, i) => i !== catIndex));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(section) ? newSet.delete(section) : newSet.add(section);
      return newSet;
    });
  };

  const toggleCategory = (catIndex) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(catIndex) ? newSet.delete(catIndex) : newSet.add(catIndex);
      return newSet;
    });
  };

  const addWorkItem = (catIndex) => {
    if (disabled || !newWorkName.trim()) return;
    const newWorkItem = {
      name: newWorkName.trim(),
      type: '',
      subtype: '',
      surfaces: [],
      linearFt: '',
      units: '',
      materialCost: '0.00',
      laborCost: '0.00',
      notes: '',
    };
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === catIndex ? { ...cat, workItems: [...cat.workItems, newWorkItem] } : cat
      )
    );
    setNewWorkName('');
  };

  const removeWorkItem = (catIndex, workIndex) => {
    if (disabled) return;
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === catIndex
          ? { ...cat, workItems: cat.workItems.filter((_, idx) => idx !== workIndex) }
          : cat
      )
    );
  };

  const handleSettingsChange = (field, value) => {
    if (disabled) return;
    setSettings((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleMiscFeeChange = (index, field, value) => {
    if (disabled) return;
    setSettings((prev) => ({
      ...prev,
      miscFees: prev.miscFees.map((fee, i) =>
        i === index
          ? { ...fee, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : fee
      ),
    }));
  };

  const addMiscFee = () => {
    if (disabled) return;
    setSettings((prev) => ({
      ...prev,
      miscFees: [...(prev.miscFees || []), { name: `Fee ${prev.miscFees.length + 1}`, amount: 0 }],
    }));
  };

  const removeMiscFee = (index) => {
    if (disabled) return;
    setSettings((prev) => ({
      ...prev,
      miscFees: prev.miscFees.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className={styles.container}>
      {/* Categories Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <button
            className={styles.toggleButton}
            onClick={() => toggleSection('categories')}
            title={expandedSections.has('categories') ? 'Collapse' : 'Expand'}
          >
            <i
              className={`fas ${
                expandedSections.has('categories') ? 'fa-chevron-down' : 'fa-chevron-right'
              }`}
            ></i>
          </button>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-list"></i> Categories
          </h3>
        </div>
        {expandedSections.has('categories') && (
          <div className={styles.categories}>
            {categories.map((cat, catIndex) => (
              <div key={catIndex} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <button
                    className={styles.toggleButton}
                    onClick={() => toggleCategory(catIndex)}
                    disabled={disabled}
                    title={expandedCategories.has(catIndex) ? 'Collapse' : 'Expand'}
                  >
                    <i
                      className={`fas ${
                        expandedCategories.has(catIndex) ? 'fa-chevron-down' : 'fa-chevron-right'
                      }`}
                    ></i>
                  </button>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                    className={styles.categoryInput}
                    placeholder="Room or Phase Name"
                    disabled={disabled}
                  />
                  {!disabled && (
                    <button
                      onClick={() => removeCategory(catIndex)}
                      className={styles.removeButton}
                      title="Remove Category"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
                {expandedCategories.has(catIndex) && (
                  <>
                    <div className={styles.workItems}>
                      {cat.workItems.map((item, workIndex) => (
                        <WorkItem
                          key={workIndex}
                          catIndex={catIndex}
                          workIndex={workIndex}
                          workItem={item}
                          setCategories={setCategories}
                          removeWorkItem={() => removeWorkItem(catIndex, workIndex)}
                          disabled={disabled}
                        />
                      ))}
                    </div>
                    {!disabled && (
                      <div className={styles.workControls}>
                        <div className={styles.inputWrapper}>
                          <i className={`fas fa-plus ${styles.inputIcon}`}></i>
                          <input
                            type="text"
                            value={newWorkName}
                            onChange={(e) => setNewWorkName(e.target.value)}
                            placeholder="e.g., Kitchen Floor"
                            className={styles.workInput}
                          />
                        </div>
                        <button
                          onClick={() => addWorkItem(catIndex)}
                          className={styles.addButton}
                          disabled={!newWorkName.trim()}
                          title="Add Work Item"
                        >
                          <i className="fas fa-plus"></i> Add Work
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Costs Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <button
            className={styles.toggleButton}
            onClick={() => toggleSection('additionalCosts')}
            title={expandedSections.has('additionalCosts') ? 'Collapse' : 'Expand'}
          >
            <i
              className={`fas ${
                expandedSections.has('additionalCosts') ? 'fa-chevron-down' : 'fa-chevron-right'
              }`}
            ></i>
          </button>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-cogs"></i> Additional Costs
          </h3>
        </div>
        {expandedSections.has('additionalCosts') && (
          <div className={styles.settingsContent}>
            <div className={styles.field}>
              <label>
                <i className="fas fa-recycle"></i> Waste Factor (%):
              </label>
              <input
                type="number"
                value={settings.wasteFactor * 100 || 0}
                onChange={(e) => handleSettingsChange('wasteFactor', e.target.value / 100)}
                min="0"
                step="0.1"
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <label>
                <i className="fas fa-truck"></i> Transportation Fee ($):
              </label>
              <input
                type="number"
                value={settings.transportationFee || 0}
                onChange={(e) => handleSettingsChange('transportationFee', e.target.value)}
                min="0"
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <label>
                <i className="fas fa-percentage"></i> Tax Rate (%):
              </label>
              <input
                type="number"
                value={settings.taxRate * 100 || 0}
                onChange={(e) => handleSettingsChange('taxRate', e.target.value / 100)}
                min="0"
                step="0.1"
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <label>
                <i className="fas fa-chart-line"></i> Markup (%):
              </label>
              {useManualMarkup ? (
                <input
                  type="number"
                  value={settings.markup * 100 || 0}
                  onChange={(e) => handleSettingsChange('markup', e.target.value / 100)}
                  min="0"
                  step="0.1"
                  disabled={disabled}
                />
              ) : (
                <select
                  value={settings.markup * 100 || 0}
                  onChange={(e) => handleSettingsChange('markup', e.target.value / 100)}
                  disabled={disabled}
                >
                  {Array.from({ length: 21 }, (_, i) => i).map((val) => (
                    <option key={val} value={val}>
                      {val}%
                    </option>
                  ))}
                </select>
              )}
              {!disabled && (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={useManualMarkup}
                    onChange={() => setUseManualMarkup(!useManualMarkup)}
                  />
                  <i className="fas fa-edit"></i> Manual
                </label>
              )}
            </div>
            <div className={styles.miscFees}>
              <label>
                <i className="fas fa-money-bill-wave"></i> Miscellaneous Fees:
              </label>
              {(settings.miscFees || []).map((fee, index) => (
                <div key={index} className={styles.miscFeeRow}>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-tag ${styles.inputIcon}`}></i>
                    <input
                      type="text"
                      value={fee.name}
                      onChange={(e) => handleMiscFeeChange(index, 'name', e.target.value)}
                      placeholder="Fee Name"
                      disabled={disabled}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-dollar-sign ${styles.inputIcon}`}></i>
                    <input
                      type="number"
                      value={fee.amount || 0}
                      onChange={(e) => handleMiscFeeChange(index, 'amount', e.target.value)}
                      min="0"
                      disabled={disabled}
                    />
                  </div>
                  {!disabled && (
                    <button
                      onClick={() => removeMiscFee(index)}
                      className={styles.removeButton}
                      title="Remove Fee"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              ))}
              {!disabled && (
                <button onClick={addMiscFee} className={styles.addButton} title="Add Miscellaneous Fee">
                  <i className="fas fa-plus"></i> Add Fee
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Tracking Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <button
            className={styles.toggleButton}
            onClick={() => toggleSection('paymentTracking')}
            title={expandedSections.has('paymentTracking') ? 'Collapse' : 'Expand'}
          >
            <i
              className={`fas ${
                expandedSections.has('paymentTracking') ? 'fa-chevron-down' : 'fa-chevron-right'
              }`}
            ></i>
          </button>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-wallet"></i> Payment Tracking
          </h3>
        </div>
        {expandedSections.has('paymentTracking') && (
          <div className={styles.settingsContent}>
            <div className={styles.field}>
              <label>
                <i className="fas fa-hand-holding-usd"></i> Deposit ($):
              </label>
              <input
                type="number"
                value={settings.deposit || 0}
                onChange={(e) => handleSettingsChange('deposit', e.target.value)}
                min="0"
                disabled={disabled}
              />
            </div>
            <div className={styles.field}>
              <label>
                <i className="fas fa-money-check-alt"></i> Amount Paid ($):
              </label>
              <input
                type="number"
                value={settings.amountPaid || 0}
                onChange={(e) => handleSettingsChange('amountPaid', e.target.value)}
                min="0"
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className={styles.totals}>
        {overpayment > 0 && (
          <div className={styles.overpaymentNotice}>
            <i className="fas fa-exclamation-circle"></i>
            <span>Overpaid by ${overpayment.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}