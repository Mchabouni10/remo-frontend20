import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faEdit,
  faTrashAlt,
  faPlusCircle,
  faSpinner,
  faExclamationTriangle,
  faClock, // Explicitly included
  faInfoCircle, // Explicitly included
  faChevronDown,
  faPhone,
  faTasks,
  faCalendarAlt,
  faDollarSign,
  faUser,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CustomersListCards.module.css";

export default function CustomersListCards({
  searchQuery,
  setSearchQuery,
  filteredCustomers,
  isLoading,
  error,
  lastUpdated,
  totals,
  notifications,
  isNotificationsOpen,
  setIsNotificationsOpen,
  handleDetails,
  handleEdit,
  handleDelete,
  handleNewProject,
  formatPhoneNumber,
  formatDate,
  navigate,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const getPaymentProgress = (customer) => {
    const total = customer.totalGrandTotal || 0;
    const remaining = customer.totalAmountRemaining || 0;
    return total > 0 ? ((total - remaining) / total) * 100 : 0;
  };

  const formatDateWithoutTime = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "N/A";

  const handleCardAction = (action, customer, e) => {
    e.stopPropagation();
    const { projects } = customer;
    if (!projects?.length) {
      alert("No projects available for this customer.");
      return;
    }

    const firstProject = projects[0];
    const hasMultipleProjects = projects.length > 1;

    switch (action) {
      case "view":
        handleDetails(projects);
        break;
      case "edit":
        if (!hasMultipleProjects && firstProject?._id) {
          handleEdit(firstProject._id);
        }
        break;
      case "delete":
        if (!hasMultipleProjects && firstProject?._id) {
          if (
            window.confirm(
              `Delete ${customer.customerInfo.firstName}'s project?`
            )
          ) {
            handleDelete(firstProject._id);
          }
        }
        break;
      case "new":
        handleNewProject(customer.customerInfo);
        break;
      default:
        break;
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Customers</h1>
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or status..."
            className={styles.searchInput}
            aria-label="Search customers"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>
      {notifications.length > 0 && (
        <div className={styles.notificationPanel}>
          <div
            className={styles.notificationHeader}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <h3>
              Notifications
              <span className={styles.notificationCountBadge}>
               ( {notifications.length} )
              </span>
            </h3>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`${styles.toggleArrow} ${
                isNotificationsOpen ? styles.open : ""
              }`}
            />
          </div>
          {isNotificationsOpen && (
            <ul className={styles.notificationList}>
              {notifications.map((note, index) => (
                <li
                  key={index}
                  className={`${styles.notificationItem} ${
                    note.overdue
                      ? styles.overdue
                      : note.nearDue
                      ? styles.warning
                      : styles.info
                  }`}
                >
                  <FontAwesomeIcon
                    icon={
                      note.overdue
                        ? faExclamationTriangle
                        : note.nearDue
                        ? faClock
                        : faInfoCircle
                    }
                    className={styles.notificationIcon}
                  />
                  {note.message}
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
      ) : paginatedCustomers.length > 0 ? (
        <>
          <div className={styles.cardsWrapper}>
            {paginatedCustomers.map((customer) => {
              const hasMultipleProjects = customer.projects.length > 1;
              const progress = getPaymentProgress(customer);

              return (
                <div
                  key={`${customer.customerInfo.lastName}-${customer.customerInfo.phone}`}
                  className={styles.customerCard}
                  onClick={() => handleDetails(customer.projects)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${customer.customerInfo.firstName} ${customer.customerInfo.lastName}`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>
                      <span className={styles.nameWrapper}>
                        <FontAwesomeIcon
                          icon={faUser}
                          className={styles.nameIcon}
                        />
                        <span style={{ marginRight: "8px" }}></span>
                        {customer.customerInfo.firstName}{" "}
                        {customer.customerInfo.lastName}
                      </span>
                    </span>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[customer.status.toLowerCase().replace(" ", "")]
                      }`}
                      title={`Status: ${customer.status}`}
                    >
                      {customer.status}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <p>
                      <FontAwesomeIcon icon={faPhone} />{" "}
                      {formatPhoneNumber(customer.customerInfo.phone) || "N/A"}
                    </p>
                    <p className={styles.projectCount}>
                      <FontAwesomeIcon icon={faTasks} /> Projects:{" "}
                      <span className={styles.projectBadge}>
                        {customer.projects.length}
                      </span>
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} /> Start:{" "}
                      {formatDateWithoutTime(customer.earliestStartDate)}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} /> End:{" "}
                      {formatDateWithoutTime(customer.latestFinishDate)}
                    </p>
                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progress}%` }}
                        ></div>
                        <span className={styles.progressText}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.amountDetails}>
                        <span className={styles.amountDue}>
                          <FontAwesomeIcon icon={faDollarSign} /> Due: $
                          {customer.totalAmountRemaining.toFixed(2)}
                        </span>
                        <span className={styles.amountTotal}>
                          <FontAwesomeIcon icon={faDollarSign} /> Total: $
                          {customer.totalGrandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      onClick={(e) => handleCardAction("view", customer, e)}
                      className={styles.actionButton}
                      title="View Details"
                      aria-label="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={(e) => handleCardAction("edit", customer, e)}
                      className={`${styles.actionButton} ${styles.editButton}`}
                      disabled={hasMultipleProjects}
                      title={
                        hasMultipleProjects
                          ? "View details to edit specific project"
                          : "Edit Project"
                      }
                      aria-label="Edit Project"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={(e) => handleCardAction("new", customer, e)}
                      className={`${styles.actionButton} ${styles.newProjectButton}`}
                      title="Add New Project"
                      aria-label="Add New Project"
                    >
                      <FontAwesomeIcon icon={faPlusCircle} />
                    </button>
                    <button
                      onClick={(e) => handleCardAction("delete", customer, e)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      disabled={hasMultipleProjects}
                      title={
                        hasMultipleProjects
                          ? "View details to delete specific project"
                          : "Delete Project"
                      }
                      aria-label="Delete Project"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className={styles.noResults}>
          No customers found.{" "}
          <button
            onClick={() => navigate("/home/customer")}
            className={styles.inlineButton}
            aria-label="Add a new customer"
          >
            Add a new customer
          </button>
          .
        </p>
      )}
      <div className={styles.totalsSection}>
        <p>
          Total Grand Total:{" "}
          <span className={styles.grandTotal}>
            ${totals.grandTotal.toFixed(2)}
          </span>
        </p>
        <p>
          Total Amount Remaining:{" "}
          <span className={styles.remaining}>
            ${totals.amountRemaining.toFixed(2)}
          </span>
        </p>
        <p className={styles.lastUpdated}>
          Last Updated: {formatDate(lastUpdated)}
        </p>
      </div>
    </div>
  );
}