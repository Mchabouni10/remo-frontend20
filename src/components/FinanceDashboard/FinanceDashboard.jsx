//src/components/FinanceDashboard/FinanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getProjects } from '../../services/projectService';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faChartLine, faChartBar } from '@fortawesome/free-solid-svg-icons';
import styles from './FinanceDashboard.module.css';

ChartJS.register(ArcElement, LineElement, PointElement, BarElement, CategoryScale, LinearScale, Filler, Tooltip, Legend);

export default function FinanceDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load financial data.');
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Generate last 12 months for x-axis
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + i);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  });

  // Aggregate data
  const collectionsByMonth = months.map(() => 0);
  const paymentMethods = { Cash: 0, Credit: 0, Debit: 0, Check: 0, Zelle: 0, Deposit: 0 };
  const materialTypes = {};
  const expensesByMonth = months.map(() => ({
    material: 0,
    labor: 0,
    tax: 0,
    waste: 0,
    transportation: 0,
    misc: 0,
    markup: 0
  }));
  const expenseCategories = { Material: 0, Labor: 0 };
  const profitByProject = [];
  let totalMaterialCost = 0;
  let totalCollections = 0;
  let totalExpenses = 0;

  projects.forEach(project => {
    const payments = project.settings?.payments || [];
    const deposit = project.settings?.deposit || 0;
    const projectDate = new Date(project.customerInfo?.startDate || project.createdAt || new Date());
    const monthIndex = months.findIndex(m => {
      const [month, year] = m.split(' ');
      return projectDate.getMonth() === new Date(Date.parse(month + ' 1, ' + year)).getMonth() &&
             projectDate.getFullYear() === parseInt(year);
    });

    // Collections
    if (deposit > 0) {
      if (monthIndex >= 0) {
        collectionsByMonth[monthIndex] += deposit;
        paymentMethods.Deposit += deposit;
      }
      totalCollections += deposit;
    }
    payments.forEach(payment => {
      if (payment.isPaid) {
        const paymentDate = new Date(payment.date);
        const paymentMonthIndex = months.findIndex(m => {
          const [month, year] = m.split(' ');
          return paymentDate.getMonth() === new Date(Date.parse(month + ' 1, ' + year)).getMonth() &&
                 paymentDate.getFullYear() === parseInt(year);
        });
        if (paymentMonthIndex >= 0) {
          collectionsByMonth[paymentMonthIndex] += payment.amount;
          paymentMethods[payment.method] += payment.amount;
        }
        totalCollections += payment.amount;
      }
    });

    // Expenses (inspired by EstimateSummary calculations)
    let materialCost = 0;
    let laborCost = 0;
    let taxCost = 0;
    let wasteCost = 0;
    let transportationCost = project.settings?.transportationFee || 0;
    let miscCost = (project.settings?.miscFees || []).reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    let markupCost = 0;

    (project.categories || []).forEach(cat => {
      (cat.workItems || []).forEach(item => {
        const units = (item.surfaces || []).reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0) ||
                      parseFloat(item.linearFt) || parseFloat(item.units) || 0;
        const matCost = (parseFloat(item.materialCost) || 0) * units;
        const labCost = (parseFloat(item.laborCost) || 0) * units;
        materialCost += matCost;
        laborCost += labCost;
        const subtype = item.subtype || 'Other';
        materialTypes[subtype] = (materialTypes[subtype] || 0) + matCost;
      });
    });

    const baseSubtotal = materialCost + laborCost;
    const wasteFactor = project.settings?.wasteFactor || 0;
    wasteCost = baseSubtotal * wasteFactor;
    const taxRate = project.settings?.taxRate || 0;
    taxCost = baseSubtotal * taxRate;
    const markup = project.settings?.markup || 0;
    markupCost = baseSubtotal * markup;

    if (monthIndex >= 0) {
      expensesByMonth[monthIndex].material += materialCost;
      expensesByMonth[monthIndex].labor += laborCost;
      expensesByMonth[monthIndex].tax += taxCost;
      expensesByMonth[monthIndex].waste += wasteCost;
      expensesByMonth[monthIndex].transportation += transportationCost;
      expensesByMonth[monthIndex].misc += miscCost;
      expensesByMonth[monthIndex].markup += markupCost;
    }

    totalMaterialCost += materialCost;
    expenseCategories.Material += materialCost;
    expenseCategories.Labor += laborCost;
    totalExpenses += materialCost + laborCost + taxCost + wasteCost + transportationCost + miscCost + markupCost;

    // Profit
    const projectCollections = payments.reduce((sum, p) => sum + (p.isPaid ? parseFloat(p.amount) || 0 : 0), 0) + deposit;
    const projectExpenses = materialCost + laborCost + taxCost + wasteCost + transportationCost + miscCost + markupCost;
    const profit = projectCollections - projectExpenses;
    profitByProject.push({
      name: project.customerInfo?.projectName || `Project ${project._id}`,
      profit,
      details: {
        customer: `${project.customerInfo?.firstName} ${project.customerInfo?.lastName}`,
        collections: projectCollections,
        expenses: projectExpenses,
        categories: project.categories || [],
        payments: payments,
        deposit
      }
    });
  });

  const totalProfit = totalCollections - totalExpenses;
  const profitMargin = totalCollections > 0 ? (totalProfit / totalCollections) * 100 : 0;

  // Chart data
  const paymentMethodData = {
    labels: Object.keys(paymentMethods).filter(method => paymentMethods[method] > 0),
    datasets: [{
      data: Object.values(paymentMethods).filter(amount => amount > 0),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      hoverOffset: 20
    }]
  };

  const collectionsData = {
    labels: months,
    datasets: [{
      label: 'Monthly Collections ($)',
      data: collectionsByMonth,
      borderColor: '#36A2EB',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const materialTypeData = {
    labels: Object.keys(materialTypes).filter(type => materialTypes[type] > 0),
    datasets: [{
      data: Object.values(materialTypes).filter(amount => amount > 0),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6B6B', '#4A90E2'],
      hoverOffset: 20
    }]
  };

  const expenseCategoryData = {
    labels: Object.keys(expenseCategories).filter(cat => expenseCategories[cat] > 0),
    datasets: [{
      data: Object.values(expenseCategories).filter(amount => amount > 0),
      backgroundColor: ['#FF6384', '#36A2EB'],
      hoverOffset: 20
    }]
  };

  const detailedExpensesData = {
    labels: months,
    datasets: [
      { label: 'Material', data: expensesByMonth.map(e => e.material), backgroundColor: '#FF6384', stack: 'Stack 0' },
      { label: 'Labor', data: expensesByMonth.map(e => e.labor), backgroundColor: '#36A2EB', stack: 'Stack 0' },
      { label: 'Tax', data: expensesByMonth.map(e => e.tax), backgroundColor: '#FFCE56', stack: 'Stack 0' },
      { label: 'Waste', data: expensesByMonth.map(e => e.waste), backgroundColor: '#4BC0C0', stack: 'Stack 0' },
      { label: 'Transportation', data: expensesByMonth.map(e => e.transportation), backgroundColor: '#9966FF', stack: 'Stack 0' },
      { label: 'Misc Fees', data: expensesByMonth.map(e => e.misc), backgroundColor: '#FF9F40', stack: 'Stack 0' },
      { label: 'Markup', data: expensesByMonth.map(e => e.markup), backgroundColor: '#FF6B6B', stack: 'Stack 0' }
    ]
  };

  const profitData = {
    labels: profitByProject.map(p => p.name).slice(0, 10),
    datasets: [{
      label: 'Profit ($)',
      data: profitByProject.map(p => p.profit).slice(0, 10),
      backgroundColor: profitByProject.map(p => p.profit >= 0 ? '#38a169' : '#e53e3e').slice(0, 10),
      borderColor: profitByProject.map(p => p.profit >= 0 ? '#38a169' : '#e53e3e').slice(0, 10),
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Poppins', size: 14, weight: 500 },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#2d3748'
        }
      },
      tooltip: {
        bodyFont: { family: 'Poppins', size: 14 },
        titleFont: { family: 'Poppins', size: 16, weight: 600 },
        callbacks: {
          label: (context) => `$${context.parsed.y?.toLocaleString() || context.parsed.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { family: 'Poppins', size: 14 },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#2d3748'
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--shadow') || 'rgba(44, 62, 80, 0.2)'
        }
      },
      y: {
        ticks: {
          font: { family: 'Poppins', size: 14 },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#2d3748',
          callback: (value) => `$${value.toLocaleString()}`
        },
        grid: {
          color: getComputedStyle(document.documentElement).getPropertyValue('--shadow') || 'rgba(44, 62, 80, 0.2)'
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        if (event.chart.canvas.id === 'profitChart') {
          setModalData(profitByProject[index].details);
          setShowModal(true);
        }
      }
    }
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Poppins', size: 14, weight: 500 },
          color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#2d3748'
        }
      },
      tooltip: {
        bodyFont: { family: 'Poppins', size: 14 },
        titleFont: { family: 'Poppins', size: 16, weight: 600 },
        callbacks: {
          label: (context) => `$${context.parsed.toLocaleString()}`
        }
      }
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  if (loading) return (
    <div className={styles.loading}>
      <FontAwesomeIcon icon={faChartPie} spin />
      Loading financial data...
    </div>
  );
  if (error) return <div className={`${styles.error} error-message`}>{error}</div>;

  return (
    <main className={styles.dashboard}>
      <div className="container">
        <header className="header">
          <h1 className="title">
            <FontAwesomeIcon icon={faChartPie} className={styles.titleIcon} />
            Finance Dashboard
          </h1>
        </header>
        <div className={styles.chartGrid}>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartPie} /> Payment Methods</h2>
            <div className={styles.metric}>
              Total Collections: <span>{formatCurrency(totalCollections)}</span>
            </div>
            <div className={styles.chartWrapper}>
              <Doughnut data={paymentMethodData} options={donutOptions} />
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartLine} /> Monthly Collections</h2>
            <div className={styles.chartWrapper}>
              <Line data={collectionsData} options={chartOptions} />
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartPie} /> Material Types</h2>
            <div className={styles.metric}>
              Total Material Cost: <span>{formatCurrency(totalMaterialCost)}</span>
            </div>
            <div className={styles.chartWrapper}>
              <Doughnut data={materialTypeData} options={donutOptions} />
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartPie} /> Expense Breakdown</h2>
            <div className={styles.metric}>
              Total Expenses: <span>{formatCurrency(totalExpenses)}</span>
            </div>
            <div className={styles.chartWrapper}>
              <Doughnut data={expenseCategoryData} options={donutOptions} />
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartBar} /> Detailed Expenses</h2>
            <div className={styles.chartWrapper}>
              <Bar data={detailedExpensesData} options={chartOptions} />
            </div>
          </div>
          <div className={styles.chartCard}>
            <h2><FontAwesomeIcon icon={faChartBar} /> Profit by Project</h2>
            <div className={styles.metric}>
              Total Profit: <span>{formatCurrency(totalProfit)}</span>
            </div>
            <div className={styles.metric}>
              Profit Margin: <span className={profitMargin >= 0 ? styles.positive : styles.negative}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className={styles.chartWrapper}>
              <Bar id="profitChart" data={profitData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h5>Project Details</h5>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              {modalData && (
                <div>
                  <h6>Customer: {modalData.customer}</h6>
                  <p><strong>Total Collections:</strong> {formatCurrency(modalData.collections)}</p>
                  <p><strong>Total Expenses:</strong> {formatCurrency(modalData.expenses)}</p>
                  <p><strong>Profit:</strong> {formatCurrency(modalData.collections - modalData.expenses)}</p>
                  <h6>Payments</h6>
                  {modalData.deposit > 0 && (
                    <p>Deposit: {formatCurrency(modalData.deposit)} (Paid)</p>
                  )}
                  {modalData.payments.length > 0 ? (
                    <table className={styles.modalTable}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.payments.map((p, i) => (
                          <tr key={i}>
                            <td>{formatDate(p.date)}</td>
                            <td>{formatCurrency(p.amount)}</td>
                            <td>{p.method || 'N/A'}</td>
                            <td>{p.isPaid ? 'Paid' : 'Pending'}</td>
                            <td>{p.note || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No additional payments recorded.</p>
                  )}
                  <h6>Categories</h6>
                  {modalData.categories.length > 0 ? (
                    modalData.categories.map((cat, i) => (
                      <div key={i}>
                        <h6>{cat.name}</h6>
                        <ul>
                          {cat.workItems.map((item, j) => (
                            <li key={j}>
                              {item.name} ({item.subtype || 'N/A'}): {formatCurrency(
                                ((parseFloat(item.materialCost) || 0) + (parseFloat(item.laborCost) || 0)) *
                                ((item.surfaces || []).reduce((sum, surf) => sum + (parseFloat(surf.sqft) || 0), 0) ||
                                  parseFloat(item.linearFt) || parseFloat(item.units) || 0)
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p>No categories recorded.</p>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className="button button--secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}