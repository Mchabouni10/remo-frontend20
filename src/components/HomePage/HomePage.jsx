// src/components/HomePage/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUndo, faArrowLeft, faEdit, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from '../CustomerInfo/CustomerInfo';
import Calculator from '../Calculator/Calculator';
import CostBreakdown from '../Calculator/CostBreakdown/CostBreakdown';
import styles from './HomePage.module.css';
import { saveProject, updateProject, getProject } from '../../services/projectService';

export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialCustomerInfo = location.pathname === '/home/new-customer-project' ? {} : location.state?.customerInfo || {};

  const validPaymentMethods = ['Credit', 'Debit', 'Check', 'Cash', 'Zelle', 'Deposit'];

  const [customer, setCustomer] = useState({
    firstName: initialCustomerInfo.firstName || '',
    lastName: initialCustomerInfo.lastName || '',
    street: initialCustomerInfo.street || '',
    unit: initialCustomerInfo.unit || '',
    state: initialCustomerInfo.state || 'IL',
    zipCode: initialCustomerInfo.zipCode || '',
    phone: initialCustomerInfo.phone || '',
    email: initialCustomerInfo.email || '',
    projectName: '',
    type: initialCustomerInfo.type || 'Residential',
    paymentType: initialCustomerInfo.paymentType || 'Cash',
    startDate: '',
    finishDate: '',
    notes: '',
  });

  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    taxRate: 0,
    transportationFee: 0,
    wasteFactor: 0,
    laborDiscount: 0,
    miscFees: [],
    deposit: 0,
    depositMethod: 'Cash',
    payments: [],
    markup: 0,
  });
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCustomerInfoVisible, setIsCustomerInfoVisible] = useState(true);

  const isDetailsMode = location.pathname.startsWith('/home/customer/') && id;
  const isEditMode = location.pathname.startsWith('/home/edit/') && id;
  const isNewMode = location.pathname === '/home/customer' || location.pathname === '/home/new-customer-project';

  useEffect(() => {
    const loadProject = async () => {
      if (id && (isEditMode || isDetailsMode)) {
        setLoading(true);
        try {
          const project = await getProject(id);
          console.log('Loaded project from server:', JSON.stringify(project, null, 2));
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
            startDate: project.customerInfo.startDate ? new Date(project.customerInfo.startDate) : '',
            finishDate: project.customerInfo.finishDate ? new Date(project.customerInfo.finishDate) : '',
            notes: project.customerInfo.notes || '',
          };
          setCustomer(normalizedCustomer);
          setCategories(project.categories || []);
          setSettings({
            taxRate: project.settings?.taxRate || 0,
            transportationFee: project.settings?.transportationFee || 0,
            wasteFactor: project.settings?.wasteFactor || 0,
            laborDiscount: project.settings?.laborDiscount || 0,
            miscFees: project.settings?.miscFees || [],
            deposit: project.settings?.deposit || 0,
            depositMethod: project.settings?.depositMethod || 'Cash',
            payments: project.settings?.payments || [],
            markup: project.settings?.markup || 0,
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
    const requiredFields = ['firstName', 'lastName', 'street', 'phone', 'startDate', 'zipCode', 'email', 'projectName'];
    const missing = requiredFields.filter((field) => {
      if (field === 'startDate') {
        return !customer[field] || (customer[field] instanceof Date && isNaN(customer[field].getTime()));
      }
      return !customer[field]?.trim();
    });

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

    // Validate payment methods
    const invalidPayments = (settings.payments || []).filter(
      payment => !validPaymentMethods.includes(payment.method)
    );
    if (invalidPayments.length > 0) {
      alert(`Invalid payment methods detected: ${invalidPayments.map(p => p.method).join(', ')}. Please use: ${validPaymentMethods.join(', ')}`);
      return;
    }

    if (!validPaymentMethods.includes(settings.depositMethod)) {
      alert(`Invalid deposit method: ${settings.depositMethod}. Please use: ${validPaymentMethods.join(', ')}`);
      return;
    }

    if (!validPaymentMethods.includes(customer.paymentType)) {
      alert(`Invalid customer payment type: ${customer.paymentType}. Please use: ${validPaymentMethods.join(', ')}`);
      return;
    }

    const projectData = {
      customerInfo: {
        ...customer,
        startDate: customer.startDate instanceof Date && !isNaN(customer.startDate.getTime())
          ? customer.startDate.toISOString().split('T')[0]
          : customer.startDate,
        finishDate: customer.finishDate instanceof Date && !isNaN(customer.finishDate.getTime())
          ? customer.finishDate.toISOString().split('T')[0]
          : customer.finishDate,
      },
      categories,
      settings: {
        ...settings,
        laborDiscount: settings.laborDiscount || 0,
        deposit: Number(settings.deposit) || 0,
        depositMethod: settings.depositMethod || 'Cash',
        payments: (settings.payments || []).map(payment => ({
          ...payment,
          date: payment.date instanceof Date ? payment.date.toISOString().split('T')[0] : payment.date,
          amount: Number(payment.amount) || 0,
          method: validPaymentMethods.includes(payment.method) ? payment.method : 'Cash',
          note: payment.note || '',
          isPaid: Boolean(payment.isPaid),
        })),
      },
    };

    console.log('Sending project data to server:', JSON.stringify(projectData, null, 2));
    setLoading(true);
    try {
      if (isEditMode && projectId) {
        const updatedProject = await updateProject(projectId, projectData);
        console.log('Updated project from server:', JSON.stringify(updatedProject, null, 2));
        alert('Project updated successfully!');
        navigate('/home/customers');
      } else if (isNewMode) {
        const newProject = await saveProject(projectData);
        console.log('New project saved:', JSON.stringify(newProject, null, 2));
        setProjectId(newProject._id);
        alert('Project saved successfully!');
        navigate('/home/customers');
      }
    } catch (err) {
      console.error('Error saving/updating project:', err);
      let errorMessage = 'Failed to save/update project. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = `Server error: ${err.response.data.error}`;
      }
      alert(errorMessage);
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
        laborDiscount: 0,
        miscFees: [],
        deposit: 0,
        depositMethod: 'Cash',
        payments: [],
        markup: 0,
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

  const toggleCustomerInfo = () => {
    setIsCustomerInfoVisible(prev => !prev);
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
    <main className={`${styles.mainContent} ${!isCustomerInfoVisible ? styles.mainContentCompact : ''}`}>
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
          <div className={`${styles.topRow} ${!isCustomerInfoVisible ? styles.customerHidden : ''}`}>
            {!isDetailsMode && (
              <button
                onClick={toggleCustomerInfo}
                className={`${styles.toggleArrow} ${isCustomerInfoVisible ? styles.toggleArrowRight : styles.toggleArrowLeft}`}
                disabled={loading}
                aria-label={isCustomerInfoVisible ? 'Hide customer information' : 'Show customer information'}
                aria-expanded={isCustomerInfoVisible}
                aria-controls="customer-section"
              >
                <FontAwesomeIcon
                  icon={isCustomerInfoVisible ? faChevronLeft : faChevronRight}
                  className={styles.toggleIcon}
                />
              </button>
            )}
            <section
              className={`${styles.customerSection} ${!isCustomerInfoVisible ? styles.customerSectionHidden : ''}`}
              id="customer-section"
            >
              <div
                className={styles.slideWrapper}
                style={{ transform: isCustomerInfoVisible ? 'translateX(0)' : 'translateX(-100%)' }}
                aria-hidden={!isCustomerInfoVisible}
              >
                <CustomerInfo
                  customer={customer}
                  setCustomer={setCustomer}
                  disabled={isDetailsMode}
                />
              </div>
            </section>
            <section className={`${styles.calculatorSection} ${!isCustomerInfoVisible ? styles.calculatorExpanded : ''}`}>
              <Calculator
                categories={categories}
                setCategories={setCategories}
                settings={settings}
                setSettings={setSettings}
                disabled={isDetailsMode}
              />
            </section>
          </div>
          <section className={styles.costBreakdownSection}>
            <CostBreakdown categories={categories} settings={settings} />
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