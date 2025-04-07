// src/components/CustomersList/CustomersListCards.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch, faEye, faEdit, faTrashAlt, faPlusCircle, faSpinner, faExclamationTriangle,
  faCheckCircle, faPhone, faTasks, faCalendarAlt, faDollarSign, faChevronDown, faChevronUp,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import styles from './CustomersListCards.module.css';

export default function CustomersListCards({
  searchQuery, setSearchQuery, filteredCustomers, isLoading, error, lastUpdated, totals,
  notifications, isNotificationsOpen, setIsNotificationsOpen, handleDetails, handleEdit,
  handleDelete, handleNewProject, formatPhoneNumber, formatDate, navigate,
}) {
  const getProgress = (startDate, finishDate) => {
    const today = new Date();
    const start = startDate ? new Date(startDate) : null;
    const finish = finishDate ? new Date(finishDate) : null;
    if (!start || !finish || isNaN(start) || isNaN(finish)) return 0;
    const total = finish - start;
    const elapsed = today - start;
    return total > 0 ? Math.min(Math.max((elapsed / total) * 100, 0), 100).toFixed(0) : 0;
  };

  const handleCardAction = (action, customer, e) => {
    e.stopPropagation(); // Prevent card click from triggering handleDetails
    const { projects } = customer;
    if (!projects?.length) {
      alert('No projects available for this customer.');
      return;
    }

    const firstProject = projects[0];
    const hasMultipleProjects = projects.length > 1;

    switch (action) {
      case 'view':
        handleDetails(projects); // Relies on useCustomers to route correctly
        break;
      case 'edit':
        if (!hasMultipleProjects && firstProject?._id) {
          handleEdit(firstProject._id); // Should navigate to /home/edit/:id
        }
        break;
      case 'delete':
        if (!hasMultipleProjects && firstProject?._id) {
          if (window.confirm(`Delete ${customer.customerInfo.firstName}'s project?`)) {
            handleDelete(firstProject._id); // Should delete and refresh, not redirect here
          }
        }
        break;
      case 'new':
        handleNewProject(customer.customerInfo); // Should navigate to /home/customer
        break;
      default:
        break;
    }
  };

  return (
    <>
      <h1 className={styles.title}>Customer Matrix</h1>
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Query by name, phone, or status..."
            className={styles.searchInput}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className={styles.clearButton}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>
      {notifications.length > 0 && (
        <div className={styles.notificationsSection}>
          <div className={styles.notificationsHeader} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            <h3>
              Alerts <span className={styles.notificationCount}>({notifications.length})</span>
            </h3>
            <FontAwesomeIcon icon={isNotificationsOpen ? faChevronUp : faChevronDown} className={styles.toggleIcon} />
          </div>
          {isNotificationsOpen && (
            <ul>
              {notifications.map((note, i) => (
                <li key={i} className={note.overdue ? styles.overdue : styles.nearDue}>
                  <FontAwesomeIcon icon={note.overdue ? faExclamationTriangle : faCheckCircle} /> {note.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {isLoading ? (
        <div className={styles.loading}>
          <FontAwesomeIcon icon={faSpinner} spin /> Loading Customers...
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className={styles.cardsWrapper}>
          {filteredCustomers.map((customer) => {
            const hasMultipleProjects = customer.projects.length > 1;
            const totalPaid = customer.projects.reduce(
              (sum, p) => sum + (p.settings?.deposit || 0) + (p.settings?.payments || []).reduce((acc, pay) => acc + (pay.isPaid ? pay.amount : 0), 0),
              0
            );
            const progress = getProgress(customer.earliestStartDate, customer.latestFinishDate);

            return (
              <div
                key={`${customer.customerInfo.lastName}-${customer.customerInfo.phone}`}
                className={styles.customerCard}
                onClick={() => handleDetails(customer.projects)} // Routes based on viewMode
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>
                    {customer.customerInfo.firstName} {customer.customerInfo.lastName}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[customer.status.toLowerCase().replace(' ', '')]}`}>
                    {customer.status}
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <p><FontAwesomeIcon icon={faPhone} /> {formatPhoneNumber(customer.customerInfo.phone)}</p>
                  <p className={styles.projectCount}>
                    <FontAwesomeIcon icon={faTasks} /> Projects: <span>{customer.projects.length}</span>
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Start: {formatDate(customer.earliestStartDate) || 'N/A'}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faCalendarAlt} /> End: {formatDate(customer.latestFinishDate) || 'N/A'}
                  </p>
                  <div className={styles.progressBar}>
                    <span>Progress: {progress}%</span>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <p className={styles.moneyDetails}>
                    <FontAwesomeIcon icon={faDollarSign} /> Due: ${customer.totalAmountRemaining.toFixed(2)}
                    <span className={styles.paidDetail}> (Paid: ${totalPaid.toFixed(2)})</span>
                  </p>
                  <p><FontAwesomeIcon icon={faDollarSign} /> Total: ${customer.totalGrandTotal.toFixed(2)}</p>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={(e) => handleCardAction('view', customer, e)}
                    className={styles.actionButton}
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    onClick={(e) => handleCardAction('edit', customer, e)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                    disabled={hasMultipleProjects}
                    title={hasMultipleProjects ? 'View details to edit specific project' : 'Edit Project'}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={(e) => handleCardAction('new', customer, e)}
                    className={`${styles.actionButton} ${styles.newProjectButton}`}
                    title="Add New Project"
                  >
                    <FontAwesomeIcon icon={faPlusCircle} />
                  </button>
                  <button
                    onClick={(e) => handleCardAction('delete', customer, e)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    disabled={hasMultipleProjects}
                    title={hasMultipleProjects ? 'View details to delete specific project' : 'Delete Project'}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.noResults}>
          No data detected. <button
            onClick={() => navigate('/home/customer')}
            className={styles.inlineButton}
          >
            Add new customer
          </button>.
        </p>
      )}
      <div className={styles.totalsSection}>
        <p>Total Grand Total: <span className={styles.grandTotal}>${totals.grandTotal.toFixed(2)}</span></p>
        <p>Total Amount Remaining: <span className={styles.remaining}>${totals.amountRemaining.toFixed(2)}</span></p>
        <p className={styles.lastUpdated}>Last Updated: {formatDate(lastUpdated)}</p>
      </div>
    </>
  );
}