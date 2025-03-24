// src/components/HomePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from '../CustomerInfo/CustomerInfo';
import Calculator from '../Calculator/Calculator';
import styles from './HomePage.module.css';
import { saveProject, updateProject, getProject } from '../../services/projectService';

export default function HomePage() {
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    street: '',
    unit: '',
    state: 'IL',
    zipCode: '',
    phone: '',
    email: '',
    projectName: '',
    type: 'Residential',
    paymentType: 'Cash',
    startDate: '',
    finishDate: '',
    notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    taxRate: 0,
    transportationFee: 0,
    wasteFactor: 0,
    miscFees: [],
    deposit: 0,
    amountPaid: 0,
  });
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isDetailsMode = location.pathname.startsWith('/home/customer/') && id;
  const isEditMode = location.pathname.startsWith('/home/edit/') && id;
  const isNewMode = location.pathname === '/home/customer' && !id;

  useEffect(() => {
    const loadProject = async () => {
      if (id && (isEditMode || isDetailsMode)) {
        setLoading(true);
        try {
          const project = await getProject(id);
          setProjectId(project._id);
          const normalizedCustomer = {
            firstName: project.customerInfo.firstName || '',
            lastName: project.customerInfo.lastName || '',
            street: project.customerInfo.street || '',
            unit: project.customerInfo.unit || '',
            state: project.customerInfo.state || 'IL',
            zipCode: project.customerInfo.zipCode || '',
            phone: project.customerInfo.phone || '',
            email: project.customerInfo.email || '',
            projectName: project.customerInfo.projectName || '',
            type: project.customerInfo.type || 'Residential',
            paymentType: project.customerInfo.paymentType || 'Cash',
            startDate: project.customerInfo.startDate
              ? new Date(project.customerInfo.startDate).toISOString().split('T')[0]
              : '',
            finishDate: project.customerInfo.finishDate
              ? new Date(project.customerInfo.finishDate).toISOString().split('T')[0]
              : '',
            notes: project.customerInfo.notes || '',
          };
          setCustomer(normalizedCustomer);
          setCategories(project.categories || []);
          setSettings(project.settings || {
            taxRate: 0,
            transportationFee: 0,
            wasteFactor: 0,
            miscFees: [],
            deposit: 0,
            amountPaid: 0,
          });
        } catch (err) {
          console.error('Error loading project:', err);
          alert('Failed to load project.');
          navigate('/home/customers');
        } finally {
          setLoading(false);
        }
      }
    };
    loadProject();
  }, [id, isEditMode, isDetailsMode, navigate]);

  const saveOrUpdateProject = async () => {
    const requiredFields = ['firstName', 'lastName', 'street', 'phone', 'startDate', 'zipCode'];
    const missing = requiredFields.filter((field) => !customer[field]?.trim());
    if (missing.length > 0) {
      alert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!/^\d{5}$/.test(customer.zipCode)) {
      alert('ZIP Code must be exactly 5 digits.');
      return;
    }

    const projectData = { customerInfo: customer, categories, settings };
    setLoading(true);
    try {
      if (isEditMode && projectId) {
        const updatedProject = await updateProject(projectId, projectData);
        console.log('Project updated:', updatedProject);
        alert('Project updated successfully!');
        navigate('/home/customers');
      } else if (isNewMode) {
        const newProject = await saveProject(projectData);
        setProjectId(newProject._id);
        console.log('Project saved:', newProject);
        alert('Project saved successfully!');
        navigate('/home/customers');
      }
    } catch (err) {
      console.error('Error saving/updating project:', err);
      alert('Failed to save/update project.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setCustomer({
        firstName: '',
        lastName: '',
        street: '',
        unit: '',
        state: 'IL',
        zipCode: '',
        phone: '',
        email: '',
        projectName: '',
        type: 'Residential',
        paymentType: 'Cash',
        startDate: '',
        finishDate: '',
        notes: '',
      });
      setCategories([]);
      setSettings({
        taxRate: 0,
        transportationFee: 0,
        wasteFactor: 0,
        miscFees: [],
        deposit: 0,
        amountPaid: 0,
      });
      setProjectId(null);
      alert('All data reset.');
    }
  };

  const handleEditClick = () => {
    if (id) {
      navigate(`/home/edit/${id}`);
    }
  };

  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <p className={styles.loadingText}>Loading project data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {isDetailsMode ? 'Project Details' : isEditMode ? 'Edit Project' : 'New Project'}
          </h1>
          {isDetailsMode && (
            <button onClick={handleEditClick} className={styles.editButton}>
              <FontAwesomeIcon icon={faEdit} className={styles.buttonIcon} />
              Edit Project
            </button>
          )}
        </div>
        <div className={styles.content}>
          <section className={styles.customerSection}>
            <CustomerInfo
              customer={customer}
              setCustomer={setCustomer}
              disabled={isDetailsMode}
            />
          </section>
          <section className={styles.calculatorSection}>
            <Calculator
              categories={categories}
              setCategories={setCategories}
              settings={settings}
              setSettings={setSettings}
              disabled={isDetailsMode}
            />
          </section>
        </div>
        <div className={styles.buttonGroup}>
          {isDetailsMode ? (
            <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
              Back to Customers
            </button>
          ) : (
            <>
              <button
                onClick={saveOrUpdateProject}
                className={styles.saveButton}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
                {loading ? 'Saving...' : isEditMode && projectId ? 'Update Project' : 'Save Project'}
              </button>
              <button onClick={resetAll} className={styles.resetButton} disabled={loading}>
                <FontAwesomeIcon icon={faUndo} className={styles.buttonIcon} />
                Reset All
              </button>
              <button
                onClick={() => navigate('/home/customers')}
                className={styles.backButton}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
                Back to Customers
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}