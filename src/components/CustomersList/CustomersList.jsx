// src/components/CustomersList/CustomersList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculatorFunctions';
import styles from './CustomersList.module.css';

export default function CustomersList() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetchedProjects = await getProjects();
        console.log('Fetched Projects:', fetchedProjects); // Debug: Check data structure
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        alert('Failed to load customers.');
      }
    };
    fetchProjects();
  }, []);

  // Filter projects based on search query
  useEffect(() => {
    const filtered = projects.filter((project) => {
      const lastName = (project.customerInfo.lastName || '').toLowerCase().trim();
      const phone = (project.customerInfo.phone || '').replace(/\D/g, '');
      const queryLower = searchQuery.toLowerCase().trim();
      const queryDigits = searchQuery.replace(/\D/g, '');

      console.log('Filter Debug:', { // Debug: Log each comparison
        lastName,
        phone,
        queryLower,
        queryDigits,
        lastNameMatch: lastName.includes(queryLower),
        phoneMatch: phone.includes(queryDigits),
      });

      return lastName.includes(queryLower) || phone.includes(queryDigits);
    });
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleDetails = (projectId) => {
    navigate(`/home/customer/${projectId}`);
  };

  const handleEdit = (projectId) => {
    navigate(`/home/edit/${projectId}`);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteProject(projectId);
        setProjects((prevProjects) => prevProjects.filter((p) => p._id !== projectId));
        setFilteredProjects((prevFiltered) => prevFiltered.filter((p) => p._id !== projectId));
        alert('Customer deleted successfully!');
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete customer.');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Customers List</h1>
      <div className={styles.searchSection}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by last name or phone number..."
          className={styles.searchInput}
        />
      </div>
      {filteredProjects.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Project</th>
              <th>Phone</th>
              <th>Start Date</th>
              <th>Finish Date</th>
              <th>Grand Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => {
              const totals = calculateTotal(
                project.categories,
                project.settings.taxRate,
                project.settings.transportationFee,
                project.settings.wasteFactor,
                project.settings.miscFees
              );
              return (
                <tr key={project._id}>
                  <td>{project.customerInfo.firstName}</td>
                  <td>{project.customerInfo.lastName}</td>
                  <td>{project.customerInfo.projectName || 'N/A'}</td>
                  <td>{project.customerInfo.phone}</td>
                  <td>{new Date(project.customerInfo.startDate).toLocaleDateString()}</td>
                  <td>
                    {project.customerInfo.finishDate
                      ? new Date(project.customerInfo.finishDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>${totals.total.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDetails(project._id)}
                      className={styles.actionButton}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEdit(project._id)}
                      className={styles.actionButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p>No customers found.</p>
      )}
    </div>
  );
}