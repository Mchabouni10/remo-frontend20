// src/components/Calculator/Category/CategoryList.jsx
import React, { useState, useMemo, useRef } from 'react';
import styles from './CategoryList.module.css';
import WorkItem from '../WorkItem/WorkItem';
import AdditionalCosts from './AdditionalCosts';
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
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSections, setExpandedSections] = useState({ categories: true });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [error, setError] = useState(null);
  const inputTimeoutRef = useRef(null);

  // Validate props
  if (!Array.isArray(categories)) {
    console.warn('categories is not an array, defaulting to empty', categories);
    categories = [];
  }
  if (typeof settings !== 'object' || settings === null) {
    console.warn('settings is not an object, defaulting to empty', settings);
    settings = {};
  }
  if (!WORK_TYPES || typeof WORK_TYPES !== 'object') {
    console.error('WORK_TYPES is invalid or not imported', WORK_TYPES);
    setError('Failed to load work types. Please contact support.');
  }

  const categoryOptions = useMemo(() => {
    if (!WORK_TYPES) return [];
    return Object.keys(WORK_TYPES).map((key) => ({
      value: key,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase()),
    }));
  }, []);

  const updateCategoryName = (catIndex, value) => {
    if (disabled) return;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      try {
        if (!value.trim()) {
          setError('Category name cannot be empty.');
          return;
        }
        const newKey = categories[catIndex].key.startsWith('custom_')
          ? `custom_${value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`
          : categories[catIndex].key;
        if (
          newKey !== categories[catIndex].key &&
          (WORK_TYPES && newKey in WORK_TYPES || categories.some((cat, i) => i !== catIndex && cat.key === newKey))
        ) {
          setError('Category name already exists or conflicts with an existing category.');
          return;
        }
        setCategories((prev) =>
          prev.map((cat, i) =>
            i === catIndex ? { ...cat, name: value.trim(), key: newKey } : cat
          )
        );
        setError(null);
      } catch (err) {
        console.error('Error updating category name:', err);
        setError('Failed to update category name. Please try again.');
      }
    }, 50);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setError(null);
  };

  const toggleCategory = (catIndex) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catIndex]: !prev[catIndex],
    }));
    setError(null);
  };

  const addWorkItem = (catIndex) => {
    if (disabled || !newWorkName.trim()) {
      setError('Work item name cannot be empty.');
      return;
    }
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      try {
        const categoryName = categories[catIndex]?.name;
        if (!categoryName) {
          console.warn(`Cannot add work item: category name is undefined at catIndex=${catIndex}`);
          setError('Invalid category. Please try again.');
          return;
        }
        const newWorkItem = {
          name: newWorkName.trim(),
          category: categoryName,
          type: '', // Initialize as empty to require manual selection
          subtype: '',
          surfaces: [], // Initialize empty; surface added in WorkItem.jsx
          materialCost: '0.00',
          laborCost: '0.00',
          notes: '',
        };
        setCategories((prev) =>
          prev.map((cat, i) =>
            i === catIndex ? { ...cat, workItems: [...(cat.workItems || []), newWorkItem] } : cat
          )
        );
        setNewWorkName('');
        setError(null);
      } catch (err) {
        console.error('Error adding work item:', err);
        setError('Failed to add work item. Please try again.');
      }
    }, 50);
  };

  const removeWorkItem = (catIndex, workIndex) => {
    if (disabled) return;
    try {
      setCategories((prev) =>
        prev.map((cat, i) =>
          i === catIndex
            ? { ...cat, workItems: (cat.workItems || []).filter((_, idx) => idx !== workIndex) }
            : cat
        )
      );
    } catch (err) {
      console.error('Error removing work item:', err);
      setError('Failed to remove work item. Please try again.');
    }
  };

  const addCategory = () => {
    if (disabled) return;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      try {
        let categoryName = '';
        let categoryKey = '';
        if (selectedCategory === 'custom' && customCategory.trim()) {
          categoryName = customCategory.trim();
          categoryKey = `custom_${customCategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
          if (WORK_TYPES && (categoryKey in WORK_TYPES || categories.some((cat) => cat.key === categoryKey))) {
            setError('Category name already exists or conflicts with an existing category.');
            return;
          }
        } else if (selectedCategory && selectedCategory !== 'custom') {
          categoryKey = selectedCategory;
          categoryName = categoryOptions.find((opt) => opt.value === selectedCategory)?.label || selectedCategory;
        } else {
          setError('Please select a category or enter a custom category name.');
          return;
        }
        setCategories((prev) => [
          { name: categoryName, key: categoryKey, workItems: [], number: prev.length + 1 },
          ...prev,
        ]);
        setSelectedCategory('');
        setCustomCategory('');
        setError(null);
      } catch (err) {
        console.error('Error adding category:', err);
        setError('Failed to add category. Please try again.');
      }
    }, 50);
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
            {error && (
              <div className={styles.errorMessage} role="alert">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
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
            {categories.length === 0 && <p>No categories added yet.</p>}
            {categories.map((cat, catIndex) => (
              <div key={cat.key} className={styles.category}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryNumber}>{cat.number}</span>
                  <button
                    className={styles.toggleButton}
                    onClick={() => toggleCategory(catIndex)}
                    disabled={disabled}
                    title={expandedCategories[catIndex] ? 'Collapse' : 'Expand'}
                    aria-expanded={expandedCategories[catIndex]}
                  >
                    <i
                      className={`fas ${
                        expandedCategories[catIndex] ? 'fa-chevron-down' : 'fa-chevron-right'
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
                {expandedCategories[catIndex] && (
                  <>
                    <div className={styles.workItems}>
                      {(cat.workItems || []).length === 0 && <p>No work items added yet.</p>}
                      {(cat.workItems || []).map((item, workIndex) => (
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
    </div>
  );
}

