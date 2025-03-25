import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrashAlt, faSort, faSortUp, faSortDown, faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { getProjects, deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculatorFunctions';
import styles from './CustomersList.module.css';

export default function CustomersList() {
  const [projects, setProjects] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();

  const groupAndSetCustomers = useCallback((projectsList) => {
    const customerMap = projectsList.reduce((acc, project) => {
      const key = `${project.customerInfo?.lastName || ''}|${project.customerInfo?.phone || ''}`;
      if (!acc[key]) {
        acc[key] = {
          customerInfo: {
            firstName: project.customerInfo?.firstName || '',
            lastName: project.customerInfo?.lastName || '',
            phone: project.customerInfo?.phone || '',
            projectName: null, // Clear project-specific fields
          },
          projects: [],
          totalGrandTotal: 0,
          totalAmountRemaining: 0,
          earliestStartDate: null,
          latestFinishDate: null,
        };
      }
      acc[key].projects.push(project);

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

      acc[key].totalGrandTotal += grandTotal;
      acc[key].totalAmountRemaining += amountRemaining;

      // Update dates
      const startDate = project.customerInfo?.startDate ? new Date(project.customerInfo.startDate) : null;
      const finishDate = project.customerInfo?.finishDate ? new Date(project.customerInfo.finishDate) : null;
      if (startDate && (!acc[key].earliestStartDate || startDate < acc[key].earliestStartDate)) {
        acc[key].earliestStartDate = startDate;
      }
      if (finishDate && (!acc[key].latestFinishDate || finishDate > acc[key].latestFinishDate)) {
        acc[key].latestFinishDate = finishDate;
      }

      // Update firstName if more specific
      if (project.customerInfo?.firstName && acc[key].customerInfo.firstName !== project.customerInfo.firstName) {
        acc[key].customerInfo.firstName = project.customerInfo.firstName;
      }
      return acc;
    }, {});

    let customers = Object.values(customerMap);

    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase().trim();
      const queryDigits = searchQuery.replace(/\D/g, '');
      customers = customers.filter((customer) => {
        const lastName = customer.customerInfo.lastName?.toLowerCase().trim() || '';
        const phone = customer.customerInfo.phone?.replace(/\D/g, '') || '';
        const matchesLastName = lastName.startsWith(queryLower);
        const matchesPhone = queryDigits.length > 0 && phone.includes(queryDigits);
        return matchesLastName || matchesPhone;
      });
    }

    if (sortConfig.key) {
      customers.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'lastName') {
          aValue = (a.customerInfo.lastName || '').toLowerCase();
          bValue = (b.customerInfo.lastName || '').toLowerCase();
        } else if (sortConfig.key === 'startDate') {
          aValue = a.earliestStartDate ? a.earliestStartDate.getTime() : 0;
          bValue = b.earliestStartDate ? b.earliestStartDate.getTime() : 0;
        } else if (sortConfig.key === 'amountRemaining') {
          aValue = a.totalAmountRemaining;
          bValue = b.totalAmountRemaining;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCustomers(customers);
  }, [searchQuery, sortConfig]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        console.log('Fetched Projects:', fetchedProjects);
        setProjects(fetchedProjects);
        groupAndSetCustomers(fetchedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        alert('Failed to load customers.');
      }
    };
    fetchProjects();
  }, [groupAndSetCustomers]);

  useEffect(() => {
    groupAndSetCustomers(projects);
  }, [projects, groupAndSetCustomers]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
  };

  const calculateTotals = () => {
    return projects.reduce(
      (acc, project) => {
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

        acc.grandTotal += grandTotal;
        acc.amountRemaining += amountRemaining;
        return acc;
      },
      { grandTotal: 0, amountRemaining: 0 }
    );
  };

  const { grandTotal, amountRemaining } = calculateTotals();

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDetails = (customerProjects) => {
    navigate('/home/customer-projects', { state: { projects: customerProjects } });
  };

  const handleEdit = (projectId) => {
    navigate(`/home/edit/${projectId}`);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects((prevProjects) => prevProjects.filter((p) => p._id !== projectId));
        alert('Project deleted successfully!');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project.');
      }
    }
  };

  const handleNewProjectForCustomer = (customerInfo) => {
    navigate('/home/customer', { state: { customerInfo } });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
    }
    return faSort;
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Customers</h1>
        <div className={styles.totalsSection}>
          <p>Total Grand Total: <span className={styles.grandTotal}>${grandTotal.toFixed(2)}</span></p>
          <p>Total Amount Remaining: <span className={styles.remaining}>${amountRemaining.toFixed(2)}</span></p>
        </div>
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by last name or phone..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className={styles.clearButton}
                title="Clear Search"
              >
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
                  <th>First Name</th>
                  <th
                    onClick={() => handleSort('lastName')}
                    className={styles.sortable}
                    aria-sort={sortConfig.key === 'lastName' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Last Name <FontAwesomeIcon icon={getSortIcon('lastName')} />
                  </th>
                  <th>Phone</th>
                  <th>Project Count</th>
                  <th
                    onClick={() => handleSort('startDate')}
                    className={styles.sortable}
                    aria-sort={sortConfig.key === 'startDate' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Earliest Start Date <FontAwesomeIcon icon={getSortIcon('startDate')} />
                  </th>
                  <th>Latest Finish Date</th>
                  <th>Total Deposit</th>
                  <th>Total Amount Paid</th>
                  <th
                    onClick={() => handleSort('amountRemaining')}
                    className={styles.sortable}
                    aria-sort={sortConfig.key === 'amountRemaining' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    Total Amount Remaining <FontAwesomeIcon icon={getSortIcon('amountRemaining')} />
                  </th>
                  <th>Total Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={`${customer.customerInfo.lastName}-${customer.customerInfo.phone}`}>
                    <td>{customer.customerInfo.firstName || 'N/A'}</td>
                    <td className={styles.firstName}>{customer.customerInfo.lastName || 'N/A'}</td>
                    <td>{customer.customerInfo.phone || 'N/A'}</td>
                    <td><span>{customer.projects.length}</span></td>
                    <td>{formatDate(customer.earliestStartDate)}</td>
                    <td>{formatDate(customer.latestFinishDate)}</td>
                    <td className={styles.currency}>
                      ${customer.projects.reduce((sum, p) => sum + (p.settings?.deposit || 0), 0).toFixed(2)}
                    </td>
                    <td className={styles.currency}>
                      ${customer.projects.reduce((sum, p) => sum + (p.settings?.amountPaid || 0), 0).toFixed(2)}
                    </td>
                    <td className={`${styles.currency} ${customer.totalAmountRemaining > 0 ? styles.remaining : styles.completed}`}>
                      ${customer.totalAmountRemaining.toFixed(2)}
                    </td>
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
                        title="Edit"
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
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </td>
                  </tr>
                ))}
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