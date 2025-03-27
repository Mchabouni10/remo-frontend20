import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faHome,
  faCreditCard,
  faCalendarAlt,
  faStickyNote,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import styles from './CustomerInfo.module.css';
import { getProjects } from '../../services/projectService';

export default function CustomerInfo({ customer, setCustomer, disabled = false }) {
  const today = new Date().toISOString().split('T')[0];
  const [busyDatesDetails, setBusyDatesDetails] = React.useState([]);
  const [isBusyDatesOpen, setIsBusyDatesOpen] = React.useState(false);

  // Fetch existing project dates with customer details
  React.useEffect(() => {
    const fetchBusyDates = async () => {
      try {
        const projects = await getProjects();
        const detailedBusyDates = projects
          .filter((project) => project.customerInfo?.startDate && project.customerInfo?.finishDate)
          .map((project) => {
            const start = new Date(project.customerInfo.startDate);
            const finish = new Date(project.customerInfo.finishDate);
            if (!isNaN(start) && !isNaN(finish) && start <= finish) {
              return {
                customerName: `${project.customerInfo.firstName} ${project.customerInfo.lastName}`,
                projectName: project.customerInfo.projectName,
                startDate: start.toISOString().split('T')[0],
                finishDate: finish.toISOString().split('T')[0],
              };
            }
            return null;
          })
          .filter(Boolean);
        setBusyDatesDetails(detailedBusyDates);
      } catch (err) {
        console.error('Error fetching busy dates:', err);
      }
    };
    if (!disabled) fetchBusyDates();
  }, [disabled]);

  const normalizeDate = (date) => {
    if (!date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date(date).toISOString().split('T')[0];
  };

  const handleDateChange = (field, value) => {
    if (disabled) return;
    const isDateBusy = busyDatesDetails.some(
      (busy) => value >= busy.startDate && value <= busy.finishDate
    );
    if (field === 'startDate' && value >= today) {
      setCustomer({
        ...customer,
        startDate: value,
        finishDate: customer.finishDate && value > customer.finishDate ? '' : customer.finishDate,
      });
      if (isDateBusy) {
        alert(`Warning: ${value} overlaps with an existing project. Check busy dates for details.`);
      }
    } else if (field === 'finishDate' && (!customer.startDate || value >= customer.startDate)) {
      setCustomer({ ...customer, finishDate: value });
      if (isDateBusy) {
        alert(`Warning: ${value} overlaps with an existing project. Check busy dates for details.`);
      }
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

  const toggleBusyDates = () => setIsBusyDatesOpen(!isBusyDatesOpen);

  return (
    <div className={styles.customerInfo}>
      <h2 className={styles.title}>Customer Information</h2>
      <div className={styles.form}>
        {/* Existing form fields remain unchanged */}
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} /> First Name{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.firstName || ''}
            onChange={(e) => handleNameChange('firstName', e.target.value)}
            className={`${styles.input} ${!customer.firstName && !disabled && styles.error}`}
            disabled={disabled}
            placeholder="Enter first name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} /> Last Name{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.lastName || ''}
            onChange={(e) => handleNameChange('lastName', e.target.value)}
            className={`${styles.input} ${!customer.lastName && !disabled && styles.error}`}
            disabled={disabled}
            placeholder="Enter last name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} /> Street{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.street || ''}
            onChange={(e) => setCustomer({ ...customer, street: e.target.value })}
            className={`${styles.input} ${!customer.street && !disabled && styles.error}`}
            disabled={disabled}
            placeholder="Enter street address"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faHome} className={styles.icon} /> Unit
          </label>
          <input
            type="text"
            value={customer.unit || ''}
            onChange={(e) => setCustomer({ ...customer, unit: e.target.value })}
            className={styles.input}
            disabled={disabled}
            placeholder="Enter unit (if any)"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} /> State
          </label>
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
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} /> ZIP Code{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.zipCode || ''}
            onChange={(e) => handleZipChange(e.target.value)}
            onBlur={handleZipBlur}
            className={`${styles.input} ${!customer.zipCode && !disabled && styles.error}`}
            maxLength="5"
            disabled={disabled}
            placeholder="Enter 5-digit ZIP"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faPhone} className={styles.icon} /> Phone{' '}
            <span className={styles.required}>*</span>
          </label>
          <PhoneInput
            country={'us'}
            onlyCountries={['us']}
            disableDropdown={true}
            countryCodeEditable={false}
            value={customer.phone || ''}
            onChange={(phone) => !disabled && setCustomer({ ...customer, phone })}
            inputClass={`${styles.phoneInput} ${!customer.phone && !disabled && styles.error}`}
            containerClass={styles.phoneContainer}
            disableCountryCode={false}
            specialLabel={''}
            disabled={disabled}
            placeholder="Enter phone number"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faEnvelope} className={styles.icon} /> Email{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={customer.email || ''}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            className={`${styles.input} ${
              (customer.email && !validateEmail(customer.email)) || (!customer.email && !disabled)
                ? styles.error
                : ''
            }`}
            disabled={disabled}
            placeholder="Enter email address"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faHome} className={styles.icon} /> Project Name{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={customer.projectName || ''}
            onChange={(e) => setCustomer({ ...customer, projectName: e.target.value })}
            className={`${styles.input} ${!customer.projectName && !disabled && styles.error}`}
            disabled={disabled}
            placeholder="Enter project name"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faHome} className={styles.icon} /> Customer Type
          </label>
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
          <label className={styles.label}>
            <FontAwesomeIcon icon={faCreditCard} className={styles.icon} /> Payment Type
          </label>
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
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} /> Start Date{' '}
            <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            value={normalizeDate(customer.startDate)}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            min={today}
            className={`${styles.input} ${!customer.startDate && !disabled && styles.error}`}
            disabled={disabled}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} /> Finish Date
          </label>
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
          <label className={styles.label}>
            <FontAwesomeIcon icon={faStickyNote} className={styles.icon} /> Notes
          </label>
          <textarea
            value={customer.notes || ''}
            onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
            className={styles.input}
            rows="3"
            disabled={disabled}
            placeholder="Add any notes"
          />
        </div>
      </div>
      {busyDatesDetails.length > 0 && !disabled && (
        <div className={styles.busyDatesSection}>
          <div className={styles.busyDatesHeader} onClick={toggleBusyDates}>
            <h3>Busy Dates</h3>
            <FontAwesomeIcon
              icon={isBusyDatesOpen ? faChevronUp : faChevronDown}
              className={styles.toggleIcon}
            />
          </div>
          {isBusyDatesOpen && (
            <ul className={styles.busyDatesList}>
              {busyDatesDetails.map((busy, index) => (
                <li key={index} className={styles.busyDateItem}>
                  <span className={styles.busyCustomer}>{busy.customerName}</span>
                  <span className={styles.busyProject}>({busy.projectName})</span>
                  <span className={styles.busyRange}>
                    {new Date(busy.startDate).toLocaleDateString()} -{' '}
                    {new Date(busy.finishDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.busyDatesNote}>
            Note: Selecting a date that overlaps with a busy period will trigger a warning.
          </p>
        </div>
      )}
    </div>
  );
}