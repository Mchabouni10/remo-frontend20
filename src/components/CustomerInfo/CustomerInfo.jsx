import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

const safeParseDate = (date) => {
  if (!date) return null;
  if (date instanceof Date && !isNaN(date.getTime())) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed;
    }
  }
  return null;
};

export default function CustomerInfo({ customer, setCustomer, disabled = false }) {
  const today = safeParseDate(new Date()) || new Date();
  const [busyDatesDetails, setBusyDatesDetails] = React.useState([]);
  const [isBusyDatesOpen, setIsBusyDatesOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchBusyDates = async () => {
      try {
        const projects = await getProjects();
        const detailedBusyDates = projects
          .filter((project) => project.customerInfo?.startDate || project.customerInfo?.finishDate)
          .map((project) => {
            const start = safeParseDate(project.customerInfo.startDate);
            const finish = safeParseDate(project.customerInfo.finishDate);
            if (start && finish && start <= finish) {
              return {
                customerName: `${project.customerInfo.firstName || ''} ${project.customerInfo.lastName || ''}`.trim(),
                projectName: project.customerInfo.projectName || 'Unnamed Project',
                startDate: start,
                finishDate: finish,
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

  const isDateBusy = (date) => {
    if (!date) return false;
    const normalizedDate = safeParseDate(date);
    if (!normalizedDate) return false;
    return busyDatesDetails.some(
      (busy) => normalizedDate >= busy.startDate && normalizedDate <= busy.finishDate
    );
  };

  const getBusyDetailsForDate = (date) => {
    const normalizedDate = safeParseDate(date);
    if (!normalizedDate) return [];
    return busyDatesDetails.filter(
      (busy) => normalizedDate >= busy.startDate && normalizedDate <= busy.finishDate
    );
  };

  const getBusyDateRanges = () => {
    return busyDatesDetails.map((busy) => ({
      start: busy.startDate,
      end: busy.finishDate,
    }));
  };

  const handleDateChange = (field, date) => {
    if (disabled) return;
    const parsedDate = safeParseDate(date);
    if (!parsedDate) {
      setCustomer({ ...customer, [field]: null });
      return;
    }
    if (isDateBusy(parsedDate)) {
      const conflicts = getBusyDetailsForDate(parsedDate);
      const conflictDetails = conflicts
        .map((busy) => `${busy.customerName} - ${busy.projectName} (${busy.startDate.toLocaleDateString()} to ${busy.finishDate.toLocaleDateString()})`)
        .join('\n');
      alert(`Warning: ${parsedDate.toLocaleDateString()} overlaps with:\n${conflictDetails}`);
    }
    if (field === 'startDate') {
      setCustomer({
        ...customer,
        startDate: parsedDate,
        finishDate: customer.finishDate && parsedDate > safeParseDate(customer.finishDate) ? null : customer.finishDate,
      });
    } else {
      setCustomer({ ...customer, [field]: parsedDate });
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

  const renderDayContents = (day, date) => {
    const isBusy = isDateBusy(date);
    const busyDetails = getBusyDetailsForDate(date);
    return (
      <div className={`${styles.dayWrapper} ${isBusy ? styles.busyDay : ''}`}>
        <span>{day}</span>
        {isBusy && (
          <>
            <div className={styles.busyIndicator} />
            <div className={styles.busyTooltip}>
              {busyDetails.map((busy, index) => (
                <div key={index} className={styles.tooltipItem}>
                  <span className={styles.tooltipCustomer}>{busy.customerName}</span>
                  <span className={styles.tooltipProject}>({busy.projectName})</span>
                  <span className={styles.tooltipRange}>
                    {busy.startDate.toLocaleDateString()} - {busy.finishDate.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const getDateValue = (date) => {
    return safeParseDate(date);
  };

  return (
    <div className={styles.customerInfo}>
      <h2 className={styles.title}>Customer Information</h2>
      <div className={styles.form}>
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
            <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.icon} /> Street, City{' '}
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
          <DatePicker
            selected={getDateValue(customer.startDate)}
            onChange={(date) => handleDateChange('startDate', date)}
            minDate={today}
            filterDate={(date) => date >= today}
            highlightDates={getBusyDateRanges()}
            renderDayContents={renderDayContents}
            className={`${styles.dateInput} ${!customer.startDate && !disabled && styles.error}`}
            disabled={disabled}
            placeholderText="Select start date"
            dateFormat="MM/dd/yyyy"
            strictParsing
            onFocus={(e) => e.target.blur()}
            showPopperArrow={false}
            popperClassName={styles.calendarPopper}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} /> Finish Date
          </label>
          <DatePicker
            selected={getDateValue(customer.finishDate)}
            onChange={(date) => handleDateChange('finishDate', date)}
            minDate={getDateValue(customer.startDate) || today}
            filterDate={(date) => date >= (getDateValue(customer.startDate) || today)}
            highlightDates={getBusyDateRanges()}
            renderDayContents={renderDayContents}
            className={styles.dateInput}
            disabled={!customer.startDate || disabled}
            placeholderText="Select finish date"
            dateFormat="MM/dd/yyyy"
            strictParsing
            onFocus={(e) => e.target.blur()}
            showPopperArrow={false}
            popperClassName={styles.calendarPopper}
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
                    {busy.startDate.toLocaleDateString()} -{' '}
                    {busy.finishDate.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.busyDatesNote}>
            Note: Hover over busy dates in the calendar for details.
          </p>
        </div>
      )}
    </div>
  );
}