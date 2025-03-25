//src/components/NewProject/NewProject.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createProject } from '../../services/projectService'; // Assume this exists
import styles from './NewProject.module.css';

export default function NewProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialCustomerInfo = location.state?.customerInfo || {};

  const [customerInfo, setCustomerInfo] = useState({
    firstName: initialCustomerInfo.firstName || '',
    lastName: initialCustomerInfo.lastName || '',
    street: initialCustomerInfo.street || '',
    unit: initialCustomerInfo.unit || '',
    state: initialCustomerInfo.state || '',
    zipCode: initialCustomerInfo.zipCode || '',
    phone: initialCustomerInfo.phone || '',
    email: initialCustomerInfo.email || '',
    projectName: '',
    type: 'Residential',
    paymentType: 'Debit',
    startDate: '',
    finishDate: '',
    notes: '',
  });

  const [categories, setCategories] = useState([]); // Always empty for new project
  const [settings, setSettings] = useState({
    taxRate: 0,
    transportationFee: 0,
    wasteFactor: 0,
    miscFees: [],
    deposit: 0,
    amountPaid: 0,
    markup: 0,
  }); // Always empty for new project

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const project = { customerInfo, categories, settings };
      await createProject(project); // Saves as a new project
      alert('Project created successfully!');
      navigate('/home/customers');
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>New Project</h1>
      <form onSubmit={handleSubmit}>
        <h2>Customer Information</h2>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={customerInfo.firstName}
            onChange={handleCustomerChange}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={customerInfo.lastName}
            onChange={handleCustomerChange}
            required
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={customerInfo.phone}
            onChange={handleCustomerChange}
          />
        </div>
        <div>
          <label>Street</label>
          <input
            type="text"
            name="street"
            value={customerInfo.street}
            onChange={handleCustomerChange}
          />
        </div>
        <div>
          <label>Project Name</label>
          <input
            type="text"
            name="projectName"
            value={customerInfo.projectName}
            onChange={handleCustomerChange}
            required
          />
        </div>
        <div>
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={customerInfo.startDate}
            onChange={handleCustomerChange}
          />
        </div>
        <div>
          <label>Finish Date</label>
          <input
            type="date"
            name="finishDate"
            value={customerInfo.finishDate}
            onChange={handleCustomerChange}
          />
        </div>
        <h2>Settings</h2>
        <div>
          <label>Deposit</label>
          <input
            type="number"
            name="deposit"
            value={settings.deposit}
            onChange={handleSettingsChange}
          />
        </div>
        <div>
          <label>Amount Paid</label>
          <input
            type="number"
            name="amountPaid"
            value={settings.amountPaid}
            onChange={handleSettingsChange}
          />
        </div>
        {/* Add more fields for categories/settings as needed */}
        <button type="submit">Save Project</button>
      </form>
    </div>
  );
}