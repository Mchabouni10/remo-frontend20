import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from '../CustomerInfo/CustomerInfo';
import Calculator from '../Calculator/Calculator';
import EstimateSummary from '../EstimateSummary/EstimateSummary';
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
  });
  const [projectId, setProjectId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isDetailsMode = location.pathname.startsWith('/home/customer/') && id;
  const isEditMode = location.pathname.startsWith('/home/edit/') && id;
  const isNewMode = location.pathname === '/home/customer' && !id;

  useEffect(() => {
    const loadProject = async () => {
      if (id && (isEditMode || isDetailsMode)) {
        try {
          const project = await getProject(id);
          setProjectId(project._id);
          const normalizedCustomer = {
            ...project.customerInfo,
            startDate: project.customerInfo.startDate
              ? new Date(project.customerInfo.startDate).toISOString().split('T')[0]
              : '',
            finishDate: project.customerInfo.finishDate
              ? new Date(project.customerInfo.finishDate).toISOString().split('T')[0]
              : '',
          };
          setCustomer(normalizedCustomer);
          setCategories(project.categories || []);
          setSettings(project.settings || {
            taxRate: 0,
            transportationFee: 0,
            wasteFactor: 0,
            miscFees: [],
          });
        } catch (err) {
          console.error('Error loading project:', err);
          alert('Failed to load project.');
          navigate('/home/customers');
        }
      }
    };
    loadProject();
  }, [id, isEditMode, isDetailsMode, navigate]);

  const saveOrUpdateProject = async () => {
    const requiredFields = ['firstName', 'lastName', 'street', 'phone', 'startDate', 'zipCode'];
    const missing = requiredFields.filter((field) => !customer[field]);
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
      });
      setProjectId(null);
      alert('All data reset.');
    }
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isDetailsMode ? 'Project Details' : isEditMode ? 'Edit Project' : 'New Project'}
        </h1>
        <div className={styles.grid}>
          <div className={styles.customerSection}>
            <CustomerInfo 
              customer={customer} 
              setCustomer={setCustomer} 
              disabled={isDetailsMode}
            />
          </div>
          <div className={styles.calculatorSection}>
            <Calculator
              categories={categories}
              setCategories={setCategories}
              settings={settings}
              setSettings={setSettings}
              disabled={isDetailsMode}
            />
          </div>
          <div className={styles.summarySection}>
            <EstimateSummary
              customer={customer}
              categories={categories}
              settings={settings}
            />
          </div>
        </div>
        {!isDetailsMode && (
          <div className={styles.buttonGroup}>
            <button onClick={saveOrUpdateProject} className={styles.saveButton}>
              <FontAwesomeIcon icon={faSave} className={styles.buttonIcon} />
              {isEditMode && projectId ? 'Update Project' : 'Save Project'}
            </button>
            <button onClick={resetAll} className={styles.resetButton}>
              <FontAwesomeIcon icon={faUndo} className={styles.buttonIcon} />
              Reset All
            </button>
          </div>
        )}
        {isDetailsMode && (
          <div className={styles.buttonGroup}>
            <button onClick={() => navigate('/home/customers')} className={styles.backButton}>
              <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
              Back to Customers
            </button>
          </div>
        )}
      </div>
    </main>
  );
}