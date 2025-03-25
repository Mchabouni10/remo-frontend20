import React, { useState } from 'react';
import CategoryList from './Category/CategoryList';
import styles from './Calculator.module.css';

export default function Calculator({ categories, setCategories, settings, setSettings, disabled = false }) {
  const [newWorkName, setNewWorkName] = useState('');

  const addCategory = () => {
    if (disabled) return;
    setCategories((prev) => [
      ...prev,
      { name: `Category ${prev.length + 1}`, workItems: [] },
    ]);
  };

  const removeCategory = (index) => {
    if (disabled) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.calculator}>
      <h2 className={styles.title}>Remodeling Calculator</h2>
      {!disabled && (
        <div className={styles.categoryControls}>
          <button onClick={addCategory} className={styles.addCategoryButton}>
            + Add Category
          </button>
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
        removeCategory={removeCategory}
      />
    </div>
  );
}