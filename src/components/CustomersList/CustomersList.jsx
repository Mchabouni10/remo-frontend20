import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrashAlt, faSort, faSortUp, faSortDown, faTimes, faPlusCircle, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getProjects, deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculations/costCalculations';
import styles from './CustomersList.module.css';

const DUE_SOON_DAYS = 7;
const OVERDUE_THRESHOLD = -1;

export default function CustomersList() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const projectTotals = (project) => {
    const totals = calculateTotal(
      project.categories || [],
      project.settings?.taxRate || 0,
      project.settings?.transportationFee || 0,
      project.settings?.wasteFactor || 0,
      project.settings?.miscFees || [],
      project.settings?.markup || 0
    );
    const grandTotal = totals.total || 0;
    return {
      grandTotal,
      amountRemaining: Math.max(0, Math.max(0, grandTotal - (project.settings?.deposit || 0)) - (project.settings?.amountPaid || 0))
    };
  };

  const groupAndSetCustomers = useCallback((projectsList) => {
    const customerMap = projectsList.reduce((acc, project) => {
      const key = `${project.customerInfo?.firstName || ''}|${project.customerInfo?.lastName || ''}|${project.customerInfo?.phone || ''}`;
      if (!acc[key]) {
        acc[key] = {
          customerInfo: { ...project.customerInfo, projectName: null },
          projects: [],
          totalGrandTotal: 0,
          totalAmountRemaining: 0,
          earliestStartDate: null,
          latestFinishDate: null,
          status: 'In Progress',
        };
      }
      acc[key].projects.push(project);
      const { grandTotal, amountRemaining } = projectTotals(project);
      acc[key].totalGrandTotal += grandTotal;
      acc[key].totalAmountRemaining += amountRemaining;

      const startDate = project.customerInfo?.startDate ? new Date(project.customerInfo.startDate) : null;
      const finishDate = project.customerInfo?.finishDate ? new Date(project.customerInfo.finishDate) : null;
      if (startDate) acc[key].earliestStartDate = acc[key].earliestStartDate ? new Date(Math.min(acc[key].earliestStartDate, startDate)) : startDate;
      if (finishDate) acc[key].latestFinishDate = acc[key].latestFinishDate ? new Date(Math.max(acc[key].latestFinishDate, finishDate)) : finishDate;

      const today = new Date();
      acc[key].status = acc[key].projects.every(p => {
        const finish = new Date(p.customerInfo?.finishDate);
        const { amountRemaining } = projectTotals(p);
        return amountRemaining === 0 && finish < today;
      }) ? 'Completed' : 
      acc[key].projects.some(p => new Date(p.customerInfo?.finishDate) < today && projectTotals(p).amountRemaining > 0) ? 'Overdue' : 'In Progress';

      return acc;
    }, {});

    let customers = Object.values(customerMap);
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase().trim();
      const queryDigits = searchQuery.replace(/\D/g, '');
      customers = customers.filter(c => (
        c.customerInfo.firstName?.toLowerCase().startsWith(queryLower) ||
        c.customerInfo.lastName?.toLowerCase().startsWith(queryLower) ||
        (queryDigits && c.customerInfo.phone?.replace(/\D/g, '').includes(queryDigits))
      ));
    }

    if (sortConfig.key) {
      customers.sort((a, b) => {
        const [aValue, bValue] = sortConfig.key === 'lastName' 
          ? [(a.customerInfo.lastName || '').toLowerCase(), (b.customerInfo.lastName || '').toLowerCase()]
          : sortConfig.key === 'startDate'
          ? [a.earliestStartDate?.getTime() || 0, b.earliestStartDate?.getTime() || 0]
          : [a.totalAmountRemaining, b.totalAmountRemaining];
        return (aValue < bValue ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
      });
    }

    return customers;
  }, [searchQuery, sortConfig]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching projects:', err);
        alert('Failed to load customers.');
      }
    };
    fetchProjects();
  }, []);

  const filteredCustomers = useMemo(() => groupAndSetCustomers(projects), [projects, groupAndSetCustomers]);
  const totals = useMemo(() => projects.reduce((acc, p) => {
    const { grandTotal, amountRemaining } = projectTotals(p);
    acc.grandTotal += grandTotal;
    acc.amountRemaining += amountRemaining;
    return acc;
  }, { grandTotal: 0, amountRemaining: 0 }), [projects]);

  const formatDate = (date) => date ? date.toLocaleDateString() : 'N/A';
  const formatTimestamp = (date) => date ? date.toLocaleString() : 'N/A';

  const notifications = useMemo(() => filteredCustomers.flatMap(customer =>
    customer.projects.map(project => {
      const finishDate = project.customerInfo?.finishDate ? new Date(project.customerInfo.finishDate) : null;
      if (!finishDate) return null;
      const daysUntilFinish = (finishDate - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilFinish <= DUE_SOON_DAYS && daysUntilFinish >= OVERDUE_THRESHOLD) {
        return {
          message: `${project.customerInfo.firstName} ${project.customerInfo.lastName}'s project is due on ${formatDate(finishDate)}.`,
          overdue: finishDate < new Date(),
        };
      }
      return null;
    }).filter(Boolean)
  ), [filteredCustomers]);

  const handleSort = (key) => setSortConfig(prev => ({
    key,
    direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
  }));

  const handleDetails = (customerProjects) => navigate('/home/customer-projects', { state: { projects: customerProjects } });
  const handleEdit = (projectId) => navigate(`/home/edit/${projectId}`);
  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects(prev => prev.filter(p => p._id !== projectId));
        setLastUpdated(new Date());
        alert('Project deleted successfully!');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project.');
      }
    }
  };
  const handleNewProjectForCustomer = (customerInfo) => navigate('/home/customer', { state: { customerInfo } });
  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleClearSearch = () => setSearchQuery('');
  const getSortIcon = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? faSortUp : faSortDown) : faSort;

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Customers</h1>
        <div className={styles.totalsSection}>
          <p>Total Grand Total: <span className={styles.grandTotal}>${totals.grandTotal.toFixed(2)}</span> <span className={styles.lastUpdated}>(Last Updated: {formatTimestamp(lastUpdated)})</span></p>
          <p>Total Amount Remaining: <span className={styles.remaining}>${totals.amountRemaining.toFixed(2)}</span> <span className={styles.lastUpdated}>(Last Updated: {formatTimestamp(lastUpdated)})</span></p>
        </div>
        {notifications.length > 0 && (
          <div className={styles.notificationsSection}>
            <h3>Notifications</h3>
            <ul>
              {notifications.map((note, index) => (
                <li key={index} className={note.overdue ? styles.overdue : styles.nearDue}>
                  <FontAwesomeIcon icon={note.overdue ? faExclamationTriangle : faCheckCircle} /> {note.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by first name, last name, or phone..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={handleClearSearch} className={styles.clearButton} title="Clear Search">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
        {filteredCustomers.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">First Name</th>
                  <th scope="col" onClick={() => handleSort('lastName')} className={styles.sortable} aria-sort={sortConfig.key === 'lastName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Last Name <FontAwesomeIcon icon={getSortIcon('lastName')} />
                  </th>
                  <th scope="col">Phone</th>
                  <th scope="col">Project Count</th>
                  <th scope="col" onClick={() => handleSort('startDate')} className={styles.sortable} aria-sort={sortConfig.key === 'startDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Earliest Start Date <FontAwesomeIcon icon={getSortIcon('startDate')} />
                  </th>
                  <th scope="col">Latest Finish Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Total Deposit</th>
                  <th scope="col">Total Amount Paid</th>
                  <th scope="col" onClick={() => handleSort('amountRemaining')} className={styles.sortable} aria-sort={sortConfig.key === 'amountRemaining' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    Total Amount Remaining <FontAwesomeIcon icon={getSortIcon('amountRemaining')} />
                  </th>
                  <th scope="col">Total Grand Total</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => {
                  const hasMultipleProjects = customer.projects.length > 1;
                  return (
                    <tr key={`${customer.customerInfo.lastName}-${customer.customerInfo.phone}`}>
                      <td>{customer.customerInfo.firstName || 'N/A'}</td>
                      <td className={styles.firstName}>{customer.customerInfo.lastName || 'N/A'}</td>
                      <td>{customer.customerInfo.phone || 'N/A'}</td>
                      <td><span>{customer.projects.length}</span></td>
                      <td>{formatDate(customer.earliestStartDate)}</td>
                      <td>{formatDate(customer.latestFinishDate)}</td>
                      <td><span className={`${styles.status} ${styles[customer.status.toLowerCase()]}`}>{customer.status}</span></td>
                      <td className={styles.currency}>${customer.projects.reduce((sum, p) => sum + (p.settings?.deposit || 0), 0).toFixed(2)}</td>
                      <td className={styles.currency}>${customer.projects.reduce((sum, p) => sum + (p.settings?.amountPaid || 0), 0).toFixed(2)}</td>
                      <td className={`${styles.currency} ${customer.totalAmountRemaining > 0 ? styles.amountDue : styles.amountPaid}`}>${customer.totalAmountRemaining.toFixed(2)}</td>
                      <td className={styles.grandTotal}>${customer.totalGrandTotal.toFixed(2)}</td>
                      <td className={styles.actions}>
                        <button 
                          onClick={() => handleDetails(customer.projects)} 
                          className={styles.actionButton} 
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          onClick={() => handleEdit(customer.projects[0]._id)} 
                          className={`${styles.actionButton} ${styles.editButton}`} 
                          title={hasMultipleProjects ? "View details to edit specific project" : "Edit"}
                          disabled={hasMultipleProjects}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          onClick={() => handleNewProjectForCustomer(customer.customerInfo)} 
                          className={`${styles.actionButton} ${styles.newProjectButton}`} 
                          title="New Project for Customer"
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.projects[0]._id)} 
                          className={`${styles.actionButton} ${styles.deleteButton}`} 
                          title={hasMultipleProjects ? "View details to delete specific project" : "Delete"}
                          disabled={hasMultipleProjects}
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
          <p className={styles.noResults}>No customers found.</p>
        )}
      </div>
    </main>
  );
}