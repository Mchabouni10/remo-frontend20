//src/components/Calculator/Category/CategoryList.jsx
import React, { useState } from 'react';
import styles from './CategoryList.module.css';
import WorkItem from '../WorkItem/WorkItem';
import PaymentTracking from './PaymentTracking';
import AdditionalCosts from './AdditionalCosts';
import CostSummary from './CostSummary';
import { WORK_TYPES as WORK_TYPES1 } from '../data/workTypes';
import { WORK_TYPES as WORK_TYPES2 } from '../data/workTypes2';

// Merge WORK_TYPES from both files
const WORK_TYPES = { ...WORK_TYPES1, ...WORK_TYPES2 };

export default function CategoryList({
  categories = [],
  setCategories,
  settings = {},
  setSettings,
  disabled = false,
  removeCategory,
}) {
  const [newWorkName, setNewWorkName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({ categories: true });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const categoryOptions = Object.keys(WORK_TYPES).map((key) => ({
    value: key,
    label: key
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase()), // e.g., 'livingRoom' -> 'Living Room'
  }));

  const updateCategoryName = (catIndex, value) => {
    if (disabled) return;
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === catIndex
          ? {
              ...cat,
              name: value,
              key: cat.key.startsWith('custom_')
                ? `custom_${value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`
                : cat.key,
            }
          : cat
      )
    );
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
      category: categoryName,
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

  const addCategory = () => {
    if (disabled) return;
    let categoryName = '';
    let categoryKey = '';

    if (selectedCategory === 'custom' && customCategory.trim()) {
      categoryName = customCategory.trim();
      categoryKey = `custom_${customCategory
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')}`;
      if (categoryKey in WORK_TYPES || categories.some((cat) => cat.key === categoryKey)) {
        alert('Category name already exists or conflicts with an existing category.');
        return;
      }
    } else if (selectedCategory && selectedCategory !== 'custom') {
      categoryKey = selectedCategory;
      categoryName = categoryOptions.find((opt) => opt.value === selectedCategory)?.label || selectedCategory;
    }

    if (!categoryName || !categoryKey) return;

    setCategories((prev) => [
      { name: categoryName, key: categoryKey, workItems: [], number: prev.length + 1 },
      ...prev,
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
            title={expandedSections.categories ? 'Collapse' : 'Expand'}
            aria-expanded={expandedSections.categories}
          >
            <i
              className={`fas ${expandedSections.categories ? 'fa-chevron-down' : 'fa-chevron-right'}`}
            ></i>
          </button>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-list"></i> Categories
          </h3>
        </div>
        {expandedSections.categories && (
          <div className={styles.categories}>
            {!disabled && (
              <div className={styles.categoryInputWrapper}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.categorySelect}
                  aria-label="Select category"
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
                      aria-label="Custom category name"
                    />
                  </div>
                )}
                <button
                  onClick={addCategory}
                  className={styles.addButton}
                  disabled={!selectedCategory || (selectedCategory === 'custom' && !customCategory.trim())}
                  title="Add Category"
                  aria-label="Add category"
                >
                  <i className="fas fa-plus"></i> Add Category
                </button>
              </div>
            )}
            {categories.map((cat, catIndex) => (
              <div key={cat.key} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryNumber}>{cat.number}</span>
                  <button
                    className={styles.toggleButton}
                    onClick={() => toggleCategory(catIndex)}
                    disabled={disabled}
                    title={expandedCategories.has(catIndex) ? 'Collapse' : 'Expand'}
                    aria-expanded={expandedCategories.has(catIndex)}
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
                    aria-label={`Category ${cat.number} name`}
                  />
                  {!disabled && (
                    <button
                      onClick={() => removeCategory(catIndex)}
                      className={styles.removeButton}
                      title="Remove Category"
                      aria-label={`Remove category ${cat.number}`}
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
                            placeholder="e.g., Outlet Installation"
                            className={styles.workInput}
                            aria-label="New work item name"
                          />
                        </div>
                        <button
                          onClick={() => addWorkItem(catIndex)}
                          className={styles.addButton}
                          disabled={!newWorkName.trim()}
                          title="Add Work Item"
                          aria-label="Add work item"
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
      <AdditionalCosts settings={settings} setSettings={setSettings} disabled={disabled} />

      {/* Payment Tracking Section */}
      <PaymentTracking
        settings={settings}
        setSettings={setSettings}
        categories={categories}
        disabled={disabled}
      />

      {/* Cost Summary Section */}
      <CostSummary categories={categories} settings={settings} />
    </div>
  );
}

