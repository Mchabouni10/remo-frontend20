// src/components/Calculator/Category.jsx
import React from 'react';
import WorkItem from '../Calculator/WorkItem/WorkItem';
import styles from './Calculator.module.css';

export default function Category({ catIndex, category, setCategories, removeCategory, addWorkItem, newWorkName, setNewWorkName, disabled = false }) {
  const updateCategoryName = (value) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) =>
        i === catIndex ? { ...cat, name: value } : cat
      )
    );
  };

  return (
    <div className={`${styles.category} ${styles.categoryBackground}`}>
      <div className={styles.categoryHeader}>
        <input
          type="text"
          value={category.name}
          onChange={(e) => updateCategoryName(e.target.value)}
          className={styles.categoryInput}
          placeholder="Room or Phase Name"
          disabled={disabled}
        />
        {!disabled && (
          <button
            onClick={() => removeCategory(catIndex)}
            className={styles.removeCategoryButton}
          >
            ×
          </button>
        )}
      </div>
      {!disabled && (
        <div className={styles.workNameContainer}>
          <input
            type="text"
            placeholder="Work Name (e.g., Kitchen Floor)"
            value={newWorkName}
            onChange={(e) => setNewWorkName(e.target.value)}
            className={styles.workNameInput}
          />
          <button
            onClick={() => addWorkItem(catIndex)}
            className={styles.addWorkButton}
            disabled={!newWorkName.trim()}
          >
            + Add Work
          </button>
        </div>
      )}
      <div className={styles.workItems}>
        {category.workItems.map((item, workIndex) => (
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
    </div>
  );
}