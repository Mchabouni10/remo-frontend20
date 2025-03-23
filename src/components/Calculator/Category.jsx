import React from 'react';
import WorkItem from '../Calculator/WorkItem/WorkItem';
import styles from './Calculator.module.css';

export default function Category({ catIndex, category, setCategories, addWorkItem, newWorkName, setNewWorkName, disabled = false }) {
  const updateCategoryName = (value) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) =>
        i === catIndex ? { ...cat, name: value } : cat
      )
    );
  };

  const removeWorkItem = (workIndex) => {
    if (disabled) return;
    setCategories((prevCategories) =>
      prevCategories.map((cat, i) =>
        i === catIndex ? { ...cat, workItems: cat.workItems.filter((_, idx) => idx !== workIndex) } : cat
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
          <div className={styles.workControls}>
            <button
              onClick={() => addWorkItem(catIndex)}
              className={styles.addWorkButton}
              disabled={!newWorkName.trim()}
            >
              + Add Work
            </button>
          </div>
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
            removeWorkItem={() => removeWorkItem(workIndex)} // Pass remove function
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}