import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEye, faEdit, faTrashAlt, faDollarSign, faCalendarAlt, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculations/costCalculations';
import { formatPhoneNumber } from '../Calculator/utils/customerhelper'; 
import styles from '../CustomersList/CustomersList.module.css'; 


export default function CustomerProjects() {
  const location = useLocation();
  const navigate = useNavigate();
  const projects = location.state?.projects || [];

  const handleBack = () => navigate('/home/customers');
  const handleDetails = (projectId) => navigate(`/home/customer/${projectId}`);
  const handleEdit = (projectId) => navigate(`/home/edit/${projectId}`);
  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        alert('Project deleted successfully!');
        navigate('/home/customers');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Projects for {projects[0]?.customerInfo?.firstName || 'Customer'} {projects[0]?.customerInfo?.lastName || ''} (
          {formatPhoneNumber(projects[0]?.customerInfo?.phone)})
        </h1>
        <button onClick={handleBack} className={`${styles.actionButton} ${styles.backButton}`} title="Back to Customers List">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        {projects.length > 0 ? (
          <div className={styles.tableWrapper}>
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
                  const amountRemaining = Math.max(0, adjustedTotal - amountPaid);

                  return (
                    <tr key={project._id}>
                      <td>{project.customerInfo?.projectName || 'Unnamed Project'}</td>
                      <td>{formatDate(project.customerInfo?.startDate)}</td>
                      <td>{formatDate(project.customerInfo?.finishDate)}</td>
                      <td
                        className={`${styles.currency} ${amountRemaining > 0 ? styles.amountDue : styles.amountPaid}`}
                        title={`Deposit: $${deposit.toFixed(2)}, Paid: $${amountPaid.toFixed(2)}`}
                      >
                        ${amountRemaining.toFixed(2)}
                        {amountRemaining > 0 ? (
                          <span className={styles.statusIndicator}> (Due)</span>
                        ) : (
                          <span className={styles.statusIndicator}> (Paid)</span>
                        )}
                      </td>
                      <td className={styles.grandTotal}>${grandTotal.toFixed(2)}</td>
                      <td className={styles.actions}>
                        <button onClick={() => handleDetails(project._id)} className={styles.actionButton} title="View Details">
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
                          onClick={() => handleDelete(project._id)}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.noResults}>No projects found for this customer.</p>
        )}
      </div>
    </main>
  );
}