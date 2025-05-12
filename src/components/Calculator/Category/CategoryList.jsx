//src/components/Calculator/Category/CategoryList.jsx

import React, { useState, useMemo } from 'react';
import styles from './CategoryList.module.css';
import WorkItem from '../WorkItem/WorkItem';
import PaymentTracking from '../PaymentTracking/PaymentTracking';
import { calculateTotal } from '../calculations/costCalculations';
import { WORK_TYPES } from '../data/workTypes';

export default function CategoryList({
  categories = [],
  setCategories,
  settings = {},
  setSettings,
  disabled = false,
  removeCategory,
}) {
  const [newWorkName, setNewWorkName] = useState('');
  const [useManualMarkup, setUseManualMarkup] = useState(false);
  const [useManualLaborDiscount, setUseManualLaborDiscount] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState(new Set(['categories']));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const categoryOptions = Object.keys(WORK_TYPES).map((key) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
  }));

  const totals = useMemo(
    () =>
      calculateTotal(
        categories,
        settings.taxRate || 0,
        settings.transportationFee || 0,
        settings.wasteFactor || 0,
        settings.miscFees || [],
        settings.markup || 0,
        settings.laborDiscount || 0
      ),
    [settings, categories]
  );

  const totalPaid = useMemo(() => {
    return (settings.payments || []).reduce((sum, payment) => sum + (payment.isPaid ? payment.amount : 0), 0) + (settings.deposit || 0);
  }, [settings.payments, settings.deposit]);

  const grandTotal = totals.total;
  const overpayment = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const updateCategoryName = (catIndex, value) => {
    if (disabled) return;
    setCategories((prev) =>
      prev.map((cat, i) => (i === catIndex ? { ...cat, name: value } : cat))
    );
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
    const categoryName = categories[catIndex]?.name;
    if (!categoryName) {
      console.error(`Cannot add work item: category name is undefined at catIndex=${catIndex}`);
      return;
    }
    const newWorkItem = {
      name: newWorkName.trim(),
      category: categoryName, // Set category to match the category name (e.g., 'Kitchen')
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

  const addCategory = () => {
    if (disabled) return;
    let categoryName = '';
    if (selectedCategory === 'custom' && customCategory.trim()) {
      categoryName = customCategory.trim();
    } else if (selectedCategory && selectedCategory !== 'custom') {
      categoryName = categoryOptions.find((opt) => opt.value === selectedCategory)?.label || selectedCategory;
    }
    if (!categoryName) return;

    setCategories((prev) => [
      ...prev,
      { name: categoryName, workItems: [] },
    ]);
    setSelectedCategory('');
    setCustomCategory('');
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
            {!disabled && (
              <div className={styles.categoryInputWrapper}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.categorySelect}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                {selectedCategory === 'custom' && (
                  <div className={styles.inputWrapper}>
                    <i className={`fas fa-tag ${styles.inputIcon}`}></i>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className={styles.categoryInput}
                    />
                  </div>
                )}
                <button
                  onClick={addCategory}
                  className={styles.addButton}
                  disabled={!selectedCategory || (selectedCategory === 'custom' && !customCategory.trim())}
                  title="Add Category"
                >
                  <i className="fas fa-plus"></i> Add Category
                </button>
              </div>
            )}
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
            <div className={styles.field}>
              <label>
                <i className="fas fa-cut"></i> Labor Discount (%):
              </label>
              {useManualLaborDiscount ? (
                <input
                  type="number"
                  value={settings.laborDiscount * 100 || 0}
                  onChange={(e) => handleSettingsChange('laborDiscount', e.target.value / 100)}
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={disabled}
                />
              ) : (
                <select
                  value={settings.laborDiscount * 100 || 0}
                  onChange={(e) => handleSettingsChange('laborDiscount', e.target.value / 100)}
                  disabled={disabled}
                >
                  {Array.from({ length: 31 }, (_, i) => i).map((val) => (
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
                    checked={useManualLaborDiscount}
                    onChange={() => setUseManualLaborDiscount(!useManualLaborDiscount)}
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
      <PaymentTracking
        settings={settings}
        setSettings={setSettings}
        categories={categories}
        disabled={disabled}
      />

      {/* Summary Section */}
      <div className={styles.totals}>
        <p><strong>Material Cost:</strong> ${totals.materialCost.toFixed(2)}</p>
        <p><strong>Labor Cost (after discount):</strong> ${totals.laborCost.toFixed(2)}</p>
        {totals.laborDiscount > 0 && (
          <p><strong>Labor Discount:</strong> -${totals.laborDiscount.toFixed(2)}</p>
        )}
        <p><strong>Waste Cost:</strong> ${totals.wasteCost.toFixed(2)}</p>
        <p><strong>Transportation Fee:</strong> ${totals.transportationFee.toFixed(2)}</p>
        <p><strong>Tax:</strong> ${totals.tax.toFixed(2)}</p>
        <p><strong>Markup:</strong> ${totals.markupCost.toFixed(2)}</p>
        <p><strong>Miscellaneous Fees:</strong> ${(settings.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0).toFixed(2)}</p>
        <p><strong>Grand Total:</strong> ${totals.total.toFixed(2)}</p>
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