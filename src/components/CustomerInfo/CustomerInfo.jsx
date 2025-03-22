// src/components/CustomerInfo/CustomerInfo.jsx
import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styles from './CustomerInfo.module.css';

export default function CustomerInfo({ customer, setCustomer, disabled = false }) {
  const today = new Date().toISOString().split('T')[0];

  // Normalize ISO date strings to yyyy-MM-dd format
  const normalizeDate = (date) => {
    if (!date) return '';
    // If date is already in yyyy-MM-dd format, return it as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Convert ISO string to yyyy-MM-dd
    return new Date(date).toISOString().split('T')[0];
  };

  const handleDateChange = (field, value) => {
    if (disabled) return;
    if (field === 'startDate' && value >= today) {
      setCustomer({ ...customer, startDate: value });
      if (customer.finishDate && value > customer.finishDate) {
        setCustomer({ ...customer, startDate: value, finishDate: '' });
      }
    } else if (field === 'finishDate' && (!customer.startDate || value >= customer.startDate)) {
      setCustomer({ ...customer, finishDate: value });
    }
  };

  const handleZipChange = (value) => {
    if (disabled) return;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 5) {
      setCustomer({ ...customer, zipCode: numericValue });
    }
  };

  const handleZipBlur = () => {
    if (disabled) return;
    const zipRegex = /^\d{5}$/;
    if (customer.zipCode && !zipRegex.test(customer.zipCode)) {
      setCustomer({ ...customer, zipCode: '' });
      alert('ZIP Code must be exactly 5 digits.');
    }
  };

  const handleNameChange = (field, value) => {
    if (disabled) return;
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    setCustomer({ ...customer, [field]: capitalized });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className={styles.customerInfo}>
      <h2 className={styles.title}>Customer Information</h2>
      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            First Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.firstName || ''}
            onChange={(e) => handleNameChange('firstName', e.target.value)}
            className={`${styles.input} ${!customer.firstName && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Last Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.lastName || ''}
            onChange={(e) => handleNameChange('lastName', e.target.value)}
            className={`${styles.input} ${!customer.lastName && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Street Number and Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.street || ''}
            onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
            className={`${styles.input} ${!customer.street && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Unit (if any)</label>
          <input
            type="text"
            value={customer.unit || ''}
            onChange={(e) => setCustomer({ ...customer, unit: e.target.value })}
            className={styles.input}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>State</label>
          <select
            value={customer.state || 'IL'}
            onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
            className={styles.input}
            disabled={disabled}
          >
            <option value="IL">Illinois</option>
            <option value="IN">Indiana</option>
            <option value="WI">Wisconsin</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            ZIP Code <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.zipCode || ''}
            onChange={(e) => handleZipChange(e.target.value)}
            onBlur={handleZipBlur}
            className={`${styles.input} ${!customer.zipCode && styles.error}`}
            maxLength="5"
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Phone Number <span className={styles.required}>*</span>
          </label>
          <PhoneInput
            country={'us'}
            onlyCountries={['us']}
            disableDropdown={true}
            countryCodeEditable={false}
            value={customer.phone || ''}
            onChange={(phone) => !disabled && setCustomer({ ...customer, phone })}
            inputClass={`${styles.phoneInput} ${!customer.phone && styles.error}`}
            containerClass={styles.phoneContainer}
            disableCountryCode={false}
            specialLabel={''}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={customer.email || ''}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className={`${styles.input} ${customer.email && !validateEmail(customer.email) && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Project Name</label>
          <input
            type="text"
            value={customer.projectName || ''}
            onChange={(e) => setCustomer({ ...customer, projectName: e.target.value })}
            className={styles.input}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Customer Type</label>
          <select
            value={customer.type || 'Residential'}
            onChange={(e) => setCustomer({ ...customer, type: e.target.value })}
            className={styles.input}
            disabled={disabled}
          >
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Payment Type</label>
          <select
            value={customer.paymentType || 'Cash'}
            onChange={(e) => setCustomer({ ...customer, paymentType: e.target.value })}
            className={styles.input}
            disabled={disabled}
          >
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
            <option value="Check">Check</option>
            <option value="Cash">Cash</option>
            <option value="Zelle">Zelle</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Estimated Start Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            value={normalizeDate(customer.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            min={today}
            className={`${styles.input} ${!customer.startDate && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Estimated Finish Date</label>
          <input
            type="date"
            value={normalizeDate(customer.finishDate)}
            onChange={(e) => handleDateChange('finishDate', e.target.value)}
            min={normalizeDate(customer.startDate) || today}
            className={styles.input}
            disabled={!customer.startDate || disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Notes</label>
          <textarea
            value={customer.notes || ''}
            onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
            className={styles.input}
            rows="3"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}