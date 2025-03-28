import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEye,
  faEdit,
  faTrashAlt,
  faDollarSign,
  faCalendarAlt,
  faProjectDiagram,
  faChevronDown,
  faChevronUp,
  faStickyNote,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { deleteProject } from "../../services/projectService";
import { calculateTotal } from "../Calculator/calculations/costCalculations";
import { formatPhoneNumber } from "../Calculator/utils/customerhelper";
import CostBreakdown from "../Calculator/CostBreakdown/CostBreakdown"; // Assuming this is in the same directory or adjust path
import styles from "../CustomersList/CustomersList.module.css";

export default function CustomerProjects() {
  const location = useLocation();
  const navigate = useNavigate();
  const projects = location.state?.projects || [];
  const [expandedProject, setExpandedProject] = useState(null);

  const handleBack = () => navigate("/home/customers");
  const handleDetails = (projectId) => navigate(`/home/customer/${projectId}`);
  const handleEdit = (projectId) => navigate(`/home/edit/${projectId}`);
  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        alert("Project deleted successfully!");
        navigate("/home/customers");
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project.");
      }
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  const getProjectStatus = (project) => {
    const today = new Date();
    const startDate = new Date(project.customerInfo?.startDate);
    const finishDate = new Date(project.customerInfo?.finishDate);
    const totals = calculateTotal(
      project.categories || [],
      project.settings?.taxRate || 0,
      project.settings?.transportationFee || 0,
      project.settings?.wasteFactor || 0,
      project.settings?.miscFees || [],
      project.settings?.markup || 0
    );
    const grandTotal = totals.total || 0;
    const deposit = project.settings?.deposit || 0;
    const amountPaid = project.settings?.amountPaid || 0;
    const amountRemaining = Math.max(
      0,
      Math.max(0, grandTotal - deposit) - amountPaid
    );

    if (amountRemaining === 0 && finishDate < today) return "Completed";
    if (finishDate < today && amountRemaining > 0) return "Overdue";
    if (startDate > today) return "Pending";
    if (startDate <= today && finishDate >= today) return "In Progress";
    return "Unknown";
  };

  const toggleProjectDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const exportProjectSummary = (project) => {
    const totals = calculateTotal(
      project.categories || [],
      project.settings?.taxRate || 0,
      project.settings?.transportationFee || 0,
      project.settings?.wasteFactor || 0,
      project.settings?.miscFees || [],
      project.settings?.markup || 0
    );
    const summary = `
      Project: ${project.customerInfo?.projectName || "Unnamed Project"}
      Customer: ${project.customerInfo?.firstName} ${
      project.customerInfo?.lastName
    }
      Phone: ${formatPhoneNumber(project.customerInfo?.phone)}
      Start Date: ${formatDate(project.customerInfo?.startDate)}
      Finish Date: ${formatDate(project.customerInfo?.finishDate)}
      Grand Total: $${totals.total.toFixed(2)}
      Amount Remaining: $${Math.max(
        0,
        Math.max(0, totals.total - (project.settings?.deposit || 0)) -
          (project.settings?.amountPaid || 0)
      ).toFixed(2)}
      Status: ${getProjectStatus(project)}
    `;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      project.customerInfo?.projectName || "project"
    }_summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const customerInfo = projects[0]?.customerInfo || {};

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <div>{`${customerInfo.firstName || "Customer"} ${
            customerInfo.lastName || ""
          } Projects`}</div>
          <div>Phone Number: {formatPhoneNumber(customerInfo.phone)}</div>
        </h1>
        <button
          onClick={handleBack}
          className={styles.backButtonEnhanced}
          title="Back to Customers List"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Customers
        </button>

        {/* Customer Info Summary */}
        <section className={styles.customerSummary}>
          <h2 className={styles.subTitle}>Customer Details</h2>
          <div className={styles.infoGrid}>
            <p>
              <strong>Address:</strong> {customerInfo.street || "N/A"}{" "}
              {customerInfo.unit ? `, ${customerInfo.unit}` : ""},{" "}
              {customerInfo.state || "N/A"} {customerInfo.zipCode || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {customerInfo.email || "N/A"}
            </p>
            <p>
              <strong>Type:</strong> {customerInfo.type || "Residential"}
            </p>
            <p>
              <strong>Payment Type:</strong>{" "}
              {customerInfo.paymentType || "Cash"}
            </p>
            {customerInfo.notes && (
              <p>
                <strong>Notes:</strong> <FontAwesomeIcon icon={faStickyNote} />{" "}
                {customerInfo.notes}
              </p>
            )}
          </div>
        </section>

        {/* Projects List */}
        {projects.length > 0 ? (
          <div className={styles.tableWrapper}>
            <h2 className={styles.subTitle}>Project List</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <FontAwesomeIcon icon={faProjectDiagram} /> Project Name
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Start Date
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faCalendarAlt} /> Finish Date
                  </th>
                  <th>Status</th>
                  <th>
                    <FontAwesomeIcon icon={faDollarSign} /> Amount Remaining
                  </th>
                  <th>
                    <FontAwesomeIcon icon={faDollarSign} /> Grand Total
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const totals = calculateTotal(
                    project.categories || [],
                    project.settings?.taxRate || 0,
                    project.settings?.transportationFee || 0,
                    project.settings?.wasteFactor || 0,
                    project.settings?.miscFees || [],
                    project.settings?.markup || 0
                  );
                  const grandTotal = totals.total || 0;
                  const deposit = project.settings?.deposit || 0;
                  const amountPaid = project.settings?.amountPaid || 0;
                  const adjustedTotal = Math.max(0, grandTotal - deposit);
                  const amountRemaining = Math.max(
                    0,
                    adjustedTotal - amountPaid
                  );
                  const status = getProjectStatus(project);
                  const isExpanded = expandedProject === project._id;

                  return (
                    <React.Fragment key={project._id}>
                      <tr className={isExpanded ? styles.expandedRow : ""}>
                        <td>
                          <button
                            className={styles.expandButton}
                            onClick={() => toggleProjectDetails(project._id)}
                            aria-expanded={isExpanded}
                          >
                            <FontAwesomeIcon
                              icon={isExpanded ? faChevronUp : faChevronDown}
                            />
                          </button>
                          {project.customerInfo?.projectName ||
                            "Unnamed Project"}
                        </td>
                        <td>{formatDate(project.customerInfo?.startDate)}</td>
                        <td>{formatDate(project.customerInfo?.finishDate)}</td>
                        <td>
                          <span
                            className={`${styles.status} ${
                              styles[status.toLowerCase()]
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td
                          className={`${styles.currency} ${
                            amountRemaining > 0
                              ? styles.amountDue
                              : styles.amountPaid
                          }`}
                          title={`Deposit: $${deposit.toFixed(
                            2
                          )}, Paid: $${amountPaid.toFixed(2)}`}
                        >
                          ${amountRemaining.toFixed(2)}
                          {amountRemaining > 0 ? (
                            <span className={styles.statusIndicator}>
                              {" "}
                              (Due)
                            </span>
                          ) : (
                            <span className={styles.statusIndicator}>
                              {" "}
                              (Paid)
                            </span>
                          )}
                        </td>
                        <td className={styles.grandTotal}>
                          ${grandTotal.toFixed(2)}
                        </td>
                        <td className={styles.actions}>
                          <button
                            onClick={() => handleDetails(project._id)}
                            className={styles.actionButton}
                            title="View Details"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleEdit(project._id)}
                            className={`${styles.actionButton} ${styles.editButton}`}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => exportProjectSummary(project)}
                            className={`${styles.actionButton} ${styles.downloadButton}`}
                            title="Download Summary"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className={styles.detailRow}>
                          <td colSpan="7">
                            <div className={styles.projectDetails}>
                              <h3>Project Details</h3>
                              {/* Customer Info for this Project */}
                              <div className={styles.detailSection}>
                                <h4>Customer Info</h4>
                                <p>
                                  <strong>Address:</strong>{" "}
                                  {project.customerInfo.street || "N/A"}{" "}
                                  {project.customerInfo.unit
                                    ? `, ${project.customerInfo.unit}`
                                    : ""}
                                  , {project.customerInfo.state || "N/A"}{" "}
                                  {project.customerInfo.zipCode || "N/A"}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {project.customerInfo.email || "N/A"}
                                </p>
                                <p>
                                  <strong>Notes:</strong>{" "}
                                  {project.customerInfo.notes || "None"}
                                </p>
                              </div>
                              {/* Cost Breakdown */}
                              <div className={styles.detailSection}>
                                <CostBreakdown
                                  categories={project.categories}
                                  settings={project.settings}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {/* Summary Totals */}
            <div className={styles.totalsSection}>
              <p>Total Projects: {projects.length}</p>
              <p>
                Total Grand Total: $
                {projects
                  .reduce(
                    (sum, p) =>
                      sum +
                      (calculateTotal(
                        p.categories || [],
                        p.settings?.taxRate || 0,
                        p.settings?.transportationFee || 0,
                        p.settings?.wasteFactor || 0,
                        p.settings?.miscFees || [],
                        p.settings?.markup || 0
                      ).total || 0),
                    0
                  )
                  .toFixed(2)}
              </p>
              <p>
                Total Amount Remaining: $
                {projects
                  .reduce((sum, p) => {
                    const totals = calculateTotal(
                      p.categories || [],
                      p.settings?.taxRate || 0,
                      p.settings?.transportationFee || 0,
                      p.settings?.wasteFactor || 0,
                      p.settings?.miscFees || [],
                      p.settings?.markup || 0
                    );
                    return (
                      sum +
                      Math.max(
                        0,
                        Math.max(0, totals.total - (p.settings?.deposit || 0)) -
                          (p.settings?.amountPaid || 0)
                      )
                    );
                  }, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <p className={styles.noResults}>
            No projects found for this customer.
          </p>
        )}
      </div>
    </main>
  );
}
