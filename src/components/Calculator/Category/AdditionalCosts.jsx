//src/components/Calculator/Category/AdditionalCosts.jsx
import React, { useState, useRef } from 'react';
import styles from './AdditionalCosts.module.css';

export default function AdditionalCosts({ settings = {}, setSettings, disabled = false }) {
  const [useManualMarkup, setUseManualMarkup] = useState(false);
  const [useManualLaborDiscount, setUseManualLaborDiscount] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ additionalCosts: true });
  const inputTimeoutRef = useRef(null);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSettingsChange = (field, value) => {
    if (disabled) return;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      let parsedValue = parseFloat(value) || 0;
      if (field === 'transportationFee' && parsedValue < 0) {
        console.warn(`handleSettingsChange: Negative ${field} (${value}) is invalid, setting to 0`);
        parsedValue = 0;
      }
      if ((field === 'laborDiscount' || field === 'markup') && parsedValue > 100) {
        console.warn(`handleSettingsChange: ${field} (${value}) exceeds 100%, capping at 100%`);
        parsedValue = 100;
      }
      setSettings((prev) => ({
        ...prev,
        [field]: (field === 'laborDiscount' || field === 'markup' || field === 'wasteFactor' || field === 'taxRate')
          ? parsedValue / 100
          : parsedValue,
      }));
    }, 50);
  };

  const handleMiscFeeChange = (index, field, value) => {
    if (disabled) return;
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
    }
    inputTimeoutRef.current = setTimeout(() => {
      if (field === 'amount') {
        let parsedValue = parseFloat(value) || 0;
        if (parsedValue < 0) {
          console.warn(`handleMiscFeeChange: Negative amount (${value}) for miscFee[${index}] is invalid, setting to 0`);
          parsedValue = 0;
        }
        setSettings((prev) => ({
          ...prev,
          miscFees: prev.miscFees.map((fee, i) =>
            i === index ? { ...fee, amount: parsedValue } : fee
          ),
        }));
      } else {
        setSettings((prev) => ({
          ...prev,
          miscFees: prev.miscFees.map((fee, i) =>
            i === index ? { ...fee, [field]: value } : fee
          ),
        }));
      }
    }, 50);
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
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => toggleSection('additionalCosts')}
          title={expandedSections.additionalCosts ? 'Collapse' : 'Expand'}
          aria-expanded={expandedSections.additionalCosts}
        >
          <i
            className={`fas ${
              expandedSections.additionalCosts ? 'fa-chevron-down' : 'fa-chevron-right'
            }`}
          ></i>
        </button>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-cogs"></i> Additional Costs
        </h3>
      </div>
      {expandedSections.additionalCosts && (
        <div className={styles.settingsContent}>
          <div className={styles.field}>
            <label>
              <i className="fas fa-recycle"></i> Waste Factor (%):
            </label>
            <input
              type="number"
              value={(settings.wasteFactor * 100).toFixed(1) || 0}
              onChange={(e) => handleSettingsChange('wasteFactor', e.target.value)}
              min="0"
              step="0.1"
              disabled={disabled}
              aria-label="Waste factor percentage"
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
              step="0.01"
              disabled={disabled}
              aria-label="Transportation fee"
            />
          </div>
          <div className={styles.field}>
            <label>
              <i className="fas fa-percentage"></i> Tax Rate (%):
            </label>
            <input
              type="number"
              value={(settings.taxRate * 100).toFixed(1) || 0}
              onChange={(e) => handleSettingsChange('taxRate', e.target.value)}
              min="0"
              step="0.1"
              disabled={disabled}
              aria-label="Tax rate percentage"
            />
          </div>
          <div className={styles.field}>
            <label>
              <i className="fas fa-chart-line"></i> Markup (%):
            </label>
            {useManualMarkup ? (
              <input
                type="number"
                value={(settings.markup * 100).toFixed(1) || 0}
                onChange={(e) => handleSettingsChange('markup', e.target.value)}
                min="0"
                max="100"
                step="0.1"
                disabled={disabled}
                aria-label="Markup percentage"
              />
            ) : (
              <select
                value={(settings.markup * 100).toFixed(0) || 0}
                onChange={(e) => handleSettingsChange('markup', e.target.value)}
                disabled={disabled}
                aria-label="Markup percentage"
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
                  aria-label="Toggle manual markup"
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
                value={(settings.laborDiscount * 100).toFixed(1) || 0}
                onChange={(e) => handleSettingsChange('laborDiscount', e.target.value)}
                min="0"
                max="100"
                step="0.1"
                disabled={disabled}
                aria-label="Labor discount percentage"
              />
            ) : (
              <select
                value={(settings.laborDiscount * 100).toFixed(0) || 0}
                onChange={(e) => handleSettingsChange('laborDiscount', e.target.value)}
                disabled={disabled}
                aria-label="Labor discount percentage"
              >
                {Array.from({ length: 101 }, (_, i) => i).map((val) => (
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
                  aria-label="Toggle manual labor discount"
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
                    aria-label={`Miscellaneous fee ${index + 1} name`}
                  />
                </div>
                <div className={styles.inputWrapper}>
                  <i className={`fas fa-dollar-sign ${styles.inputIcon}`}></i>
                  <input
                    type="number"
                    value={fee.amount || 0}
                    onChange={(e) => handleMiscFeeChange(index, 'amount', e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={disabled}
                    aria-label={`Miscellaneous fee ${index + 1} amount`}
                  />
                </div>
                {!disabled && (
                  <button
                    onClick={() => removeMiscFee(index)}
                    className={styles.removeButton}
                    title="Remove Fee"
                    aria-label={`Remove miscellaneous fee ${index + 1}`}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </div>
            ))}
            {!disabled && (
              <button
                onClick={addMiscFee}
                className={styles.addButton}
                title="Add Miscellaneous Fee"
                aria-label="Add miscellaneous fee"
              >
                <i className="fas fa-plus"></i> Add Fee
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
