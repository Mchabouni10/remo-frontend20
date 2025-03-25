import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculatorFunctions';
import styles from '../CustomersList/CustomersList.module.css'; // Reuse styles

export default function CustomerProjects() {
  const location = useLocation();
  const navigate = useNavigate();
  const projects = location.state?.projects || [];

  const handleDetails = (projectId) => {
    navigate(`/home/customer/${projectId}`);
  };

  const handleEdit = (projectId) => {
    navigate(`/home/edit/${projectId}`);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        alert('Project deleted successfully!');
        navigate('/home/customers'); // Refresh customer list
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Customer Projects</h1>
      {projects.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Start Date</th>
                <th>Finish Date</th>
                <th>Deposit</th>
                <th>Amount Paid</th>
                <th>Amount Remaining</th>
                <th>Grand Total</th>
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

                const formatDate = (dateString) =>
                  dateString
                    ? `${new Date(dateString).getUTCMonth() + 1}/${new Date(dateString).getUTCDate()}/${new Date(dateString).getUTCFullYear()}`
                    : 'N/A';

                return (
                  <tr key={project._id}>
                    <td>{project.customerInfo?.projectName || 'Unnamed Project'}</td>
                    <td>{formatDate(project.customerInfo?.startDate)}</td>
                    <td>{formatDate(project.customerInfo?.finishDate)}</td>
                    <td className={styles.currency}>${deposit.toFixed(2)}</td>
                    <td className={styles.currency}>${amountPaid.toFixed(2)}</td>
                    <td className={`${styles.currency} ${amountRemaining > 0 ? styles.remaining : styles.completed}`}>
                      ${amountRemaining.toFixed(2)}
                    </td>
                    <td className={styles.grandTotal}>${grandTotal.toFixed(2)}</td>
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
  );
}