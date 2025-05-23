//src/components/Calculator/PaymentTracking/PaymentTracking.jsx
import React, { useState, useMemo } from 'react';
import { calculateTotal } from '../calculations/costCalculations';
import styles from './PaymentTracking.module.css';

export default function PaymentTracking({ settings, setSettings, categories, disabled = false }) {
  console.log('PaymentTracking rendered with props:', {
    settings: JSON.stringify(settings, null, 2),
    categories: JSON.stringify(categories, null, 2),
    disabled,
  });

  const validMethods = ['Credit', 'Debit', 'Check', 'Cash', 'Zelle'];

  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'Cash',
    note: '',
    isPaid: false,
  });
  const [newDepositAmount, setNewDepositAmount] = useState('');
  const [newDepositMethod, setNewDepositMethod] = useState('Cash');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPayment, setEditedPayment] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    paymentTracking: true,
    paymentEntries: true,
    addPayment: false,
  });
  const [error, setError] = useState(null);

  const totals = useMemo(() => {
    console.log('Calculating totals with:', {
      categories: JSON.stringify(categories, null, 2),
      settings: JSON.stringify(settings, null, 2),
    });
    const result = calculateTotal(
      categories,
      settings.taxRate || 0,
      settings.transportationFee || 0,
      settings.wasteFactor || 0,
      settings.miscFees || [],
      settings.markup || 0,
      settings.laborDiscount || 0
    );
    const totals = {
      ...result,
      total: result.total || 0,
      materialCost: result.materialCost || 0,
      laborCost: result.laborCost || 0,
      laborDiscount: result.laborDiscount || 0,
    };
    console.log('Calculated totals:', JSON.stringify(totals, null, 2));
    return totals;
  }, [categories, settings]);

  const grandTotal = totals.total;

  const paymentsWithDeposit = useMemo(() => {
    console.log('Computing paymentsWithDeposit with:', {
      payments: JSON.stringify(settings.payments, null, 2),
    });
    return Array.isArray(settings.payments) ? settings.payments : [];
  }, [settings.payments]);

  const totalPaid = useMemo(() => {
    console.log('Calculating totalPaid from payments:', JSON.stringify(paymentsWithDeposit, null, 2));
    const total = paymentsWithDeposit.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      const increment = payment.isPaid ? amount : 0;
      console.log(`Payment: ${JSON.stringify(payment)}, isPaid: ${payment.isPaid}, increment: ${increment}`);
      return sum + increment;
    }, 0);
    console.log('Total paid:', total);
    return total;
  }, [paymentsWithDeposit]);

  const amountRemaining = Math.max(0, grandTotal - totalPaid);
  const amountDue = paymentsWithDeposit.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    const increment = !payment.isPaid ? amount : 0;
    console.log(`Calculating amountDue, payment: ${JSON.stringify(payment)}, increment: ${increment}`);
    return sum + increment;
  }, 0);
  const overduePayments = useMemo(() => {
    console.log('Calculating overduePayments');
    const today = new Date().toISOString().split('T')[0];
    const overdue = paymentsWithDeposit.filter(
      (payment) => !payment.isPaid && payment.date.split('T')[0] < today
    ).reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0;
      console.log(`Overdue payment: ${JSON.stringify(payment)}, amount: ${amount}`);
      return sum + amount;
    }, 0);
    console.log('Overdue payments total:', overdue);
    return overdue;
  }, [paymentsWithDeposit]);

  const overpaid = totalPaid > grandTotal ? totalPaid - grandTotal : 0;
  console.log('Summary:', { grandTotal, totalPaid, amountRemaining, amountDue, overduePayments, overpaid });

  const toggleSection = (section) => {
    console.log(`Toggling section: ${section}`);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setError(null);
    console.log('New expandedSections:', JSON.stringify(expandedSections, null, 2));
  };

  const validatePayment = (payment) => {
    console.log('Validating payment:', JSON.stringify(payment, null, 2));
    if (!payment.date || isNaN(Date.parse(payment.date))) {
      console.warn('Invalid payment date');
      return 'Please select a valid date.';
    }
    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount < 0.01) {
      console.warn(`Invalid payment amount: ${amount}`);
      return 'Payment amount must be at least $0.01.';
    }
    if (!validMethods.includes(payment.method)) {
      console.warn(`Invalid payment method: ${payment.method}`);
      return 'Please select a valid payment method.';
    }
    console.log('Payment validation passed');
    return null;
  };

  const addDeposit = () => {
    if (disabled) {
      console.log('addDeposit blocked: component is disabled');
      return;
    }
    const amount = parseFloat(newDepositAmount);
    if (isNaN(amount) || amount < 0.01) {
      setError('Please enter a valid deposit amount');
      return;
    }

    setSettings((prev) => {
      const payments = prev.payments || [];
      const newPayments = payments[0]?.note === 'Deposit payment'
        ? [
            {
              date: new Date().toISOString(),
              amount,
              method: newDepositMethod,
              note: 'Deposit payment',
              isPaid: true,
            },
            ...payments.slice(1),
          ]
        : [
            {
              date: new Date().toISOString(),
              amount,
              method: newDepositMethod,
              note: 'Deposit payment',
              isPaid: true,
            },
            ...payments,
          ];

      const newSettings = { ...prev, payments: newPayments };
      console.log('Updated settings with new deposit:', JSON.stringify(newSettings, null, 2));
      return newSettings;
    });

    setNewDepositAmount('');
    setNewDepositMethod('Cash');
    setError(null);
  };

  const handleNewPaymentChange = (field, value) => {
    console.log(`handleNewPaymentChange called: field=${field}, value=${value}`);
    setNewPayment((prev) => {
      const newPayment = { ...prev, [field]: value };
      console.log('New payment state:', JSON.stringify(newPayment, null, 2));
      return newPayment;
    });
  };

  const addPayment = () => {
    if (disabled) {
      console.log('addPayment blocked: component is disabled');
      return;
    }
    console.log('addPayment called with newPayment:', JSON.stringify(newPayment, null, 2));

    const validationError = validatePayment(newPayment);
    if (validationError) {
      console.warn('Payment validation failed:', validationError);
      setError(validationError);
      return;
    }

    try {
      const payment = {
        date: new Date(newPayment.date).toISOString(),
        amount: parseFloat(newPayment.amount),
        method: validMethods.includes(newPayment.method) ? newPayment.method : 'Cash',
        note: newPayment.note.trim(),
        isPaid: newPayment.isPaid,
      };
      console.log('Adding payment:', JSON.stringify(payment, null, 2));
      setSettings((prev) => {
        const newPayments = [...(prev.payments || [])];
        // Insert after deposit if it exists
        const insertIndex = prev.payments[0]?.note === 'Deposit payment' ? 1 : 0;
        newPayments.splice(insertIndex, 0, payment);
        const newSettings = { ...prev, payments: newPayments };
        console.log('Updated settings with new payment:', JSON.stringify(newSettings, null, 2));
        return newSettings;
      });
      setNewPayment({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: 'Cash',
        note: '',
        isPaid: false,
      });
      setExpandedSections((prev) => ({
        ...prev,
        addPayment: false,
      }));
      setError(null);
      console.log('Payment added successfully');
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Failed to add payment. Please try again.');
    }
  };

  const togglePaymentStatus = (index) => {
    if (disabled) {
      console.log('togglePaymentStatus blocked: component is disabled');
      return;
    }
    console.log(`togglePaymentStatus called for index: ${index}`);
    try {
      setSettings((prev) => {
        const newPayments = prev.payments.map((payment, i) =>
          i === index ? { ...payment, isPaid: !payment.isPaid } : payment
        );
        const newSettings = { ...prev, payments: newPayments };
        console.log('Updated settings after toggling payment status:', JSON.stringify(newSettings, null, 2));
        return newSettings;
      });
    } catch (err) {
      console.error('Error toggling payment status:', err);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const removePayment = (index) => {
    if (disabled) {
      console.log('removePayment blocked: component is disabled');
      return;
    }
    if (index === 0 && paymentsWithDeposit[0]?.note === 'Deposit payment') {
      if (!window.confirm('Are you sure you want to remove the deposit payment?')) {
        return;
      }
    }
    console.log(`removePayment called for index: ${index}`);
    try {
      setSettings((prev) => {
        const newPayments = prev.payments.filter((_, i) => i !== index);
        const newSettings = { ...prev, payments: newPayments };
        console.log('Updated settings after removing payment:', JSON.stringify(newSettings, null, 2));
        return newSettings;
      });
    } catch (err) {
      console.error('Error removing payment:', err);
      setError('Failed to remove payment. Please try again.');
    }
  };

  const startEditing = (index) => {
    if (disabled) {
      console.log('startEditing blocked: component is disabled');
      return;
    }
    console.log(`startEditing called for index: ${index}`);
    const payment = paymentsWithDeposit[index];
    setEditingIndex(index);
    setEditedPayment({
      ...payment,
      date: new Date(payment.date).toISOString().split('T')[0],
    });
    setError(null);
    console.log('Editing payment:', JSON.stringify(editedPayment, null, 2));
  };

  const handleEditChange = (field, value) => {
    console.log(`handleEditChange called: field=${field}, value=${value}`);
    setEditedPayment((prev) => {
      const newEditedPayment = {
        ...prev,
        [field]: field === 'amount' ? parseFloat(value) || '' : value,
      };
      console.log('New edited payment:', JSON.stringify(newEditedPayment, null, 2));
      return newEditedPayment;
    });
  };

  const saveEdit = (index) => {
    if (disabled) {
      console.log('saveEdit blocked: component is disabled');
      return;
    }
    console.log(`saveEdit called for index: ${index}`);

    const validationError = validatePayment(editedPayment);
    if (validationError) {
      console.warn('Edited payment validation failed:', validationError);
      setError(validationError);
      return;
    }

    try {
      setSettings((prev) => {
        const newPayments = prev.payments.map((payment, i) =>
          i === index
            ? {
                ...editedPayment,
                date: new Date(editedPayment.date).toISOString(),
                amount: parseFloat(editedPayment.amount),
                method: validMethods.includes(editedPayment.method) ? editedPayment.method : 'Cash',
              }
            : payment
        );
        const newSettings = { ...prev, payments: newPayments };
        console.log('Updated settings after saving edit:', JSON.stringify(newSettings, null, 2));
        return newSettings;
      });
      setEditingIndex(null);
      setEditedPayment(null);
      setError(null);
      console.log('Payment edit saved successfully');
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment. Please try again.');
    }
  };

  const cancelEdit = () => {
    console.log('cancelEdit called');
    setEditingIndex(null);
    setEditedPayment(null);
    setError(null);
    console.log('Editing cancelled');
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => toggleSection('paymentTracking')}
          title={expandedSections.paymentTracking ? 'Collapse' : 'Expand'}
          aria-expanded={expandedSections.paymentTracking}
        >
          <i
            className={`fas ${
              expandedSections.paymentTracking ? 'fa-chevron-down' : 'fa-chevron-right'
            }`}
          ></i>
        </button>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-wallet"></i> Payment Tracking
        </h3>
      </div>
      {expandedSections.paymentTracking && (
        <div className={styles.settingsContent}>
          {error && (
            <div className={styles.errorMessage} role="alert">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
          <div className={styles.field}>
            <label>
              <i className="fas fa-hand-holding-usd"></i> Initial Deposit:
            </label>
            {settings.payments?.length > 0 && settings.payments[0]?.note === 'Deposit payment' ? (
              <div className={styles.depositInfo}>
                <span>
                  ${settings.payments[0].amount.toFixed(2)} ({settings.payments[0].method})
                </span>
                <button
                  onClick={() => removePayment(0)}
                  className={styles.removeButton}
                  disabled={disabled}
                  aria-label="Remove deposit"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ) : (
              <>
                <input
                  type="number"
                  value={newDepositAmount}
                  onChange={(e) => setNewDepositAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  disabled={disabled}
                  aria-label="Deposit amount"
                  placeholder="0.00"
                />
                <select
                  value={newDepositMethod}
                  onChange={(e) => setNewDepositMethod(e.target.value)}
                  disabled={disabled}
                  aria-label="Deposit method"
                >
                  {validMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addDeposit}
                  className={styles.addButton}
                  disabled={disabled || !newDepositAmount || parseFloat(newDepositAmount) < 0.01}
                  aria-label="Add deposit"
                >
                  <i className="fas fa-plus"></i> Add Deposit
                </button>
              </>
            )}
          </div>

          <div className={styles.summary}>
            <p><strong>Grand Total:</strong> ${grandTotal.toFixed(2)}</p>
            <p><strong>Material Cost:</strong> ${totals.materialCost.toFixed(2)}</p>
            <p><strong>Labor Cost (after discount):</strong> ${totals.laborCost.toFixed(2)}</p>
            {totals.laborDiscount > 0 && (
              <p><strong>Labor Discount:</strong> -${totals.laborDiscount.toFixed(2)}</p>
            )}
            <p>
              <strong>Deposit:</strong> $
              {(settings.payments?.[0]?.note === 'Deposit payment'
                ? settings.payments[0].amount
                : 0
              ).toFixed(2)}
            </p>
            <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
            <p><strong>Amount Remaining:</strong> ${amountRemaining.toFixed(2)}</p>
            <p><strong>Amount Due:</strong> ${amountDue.toFixed(2)}</p>
            {overduePayments > 0 && (
              <p className={styles.overdue}>
                <strong>Overdue:</strong> ${overduePayments.toFixed(2)}
              </p>
            )}
            {overpaid > 0 && (
              <p className={styles.overdue}>
                <strong>Overpaid by:</strong> ${overpaid.toFixed(2)}
              </p>
            )}
          </div>

          <div className={styles.paymentList}>
            <div className={styles.subSectionHeader}>
              <button
                className={styles.toggleButton}
                onClick={() => toggleSection('paymentEntries')}
                title={expandedSections.paymentEntries ? 'Collapse' : 'Expand'}
                aria-expanded={expandedSections.paymentEntries}
              >
                <i
                  className={`fas ${
                    expandedSections.paymentEntries ? 'fa-chevron-down' : 'fa-chevron-right'
                  }`}
                ></i>
              </button>
              <h4>Payment Entries</h4>
            </div>
            {expandedSections.paymentEntries && (
              <>
                {paymentsWithDeposit.length === 0 ? (
                  <p>No payments recorded yet.</p>
                ) : (
                  <table className={styles.paymentTable} aria-label="Payment Entries">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Method</th>
                        <th scope="col">Note</th>
                        <th scope="col">Status</th>
                        {!disabled && <th scope="col">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsWithDeposit.map((payment, index) => (
                        editingIndex === index ? (
                          <tr key={index}>
                            <td>
                              <input
                                type="date"
                                value={editedPayment.date}
                                onChange={(e) => handleEditChange('date', e.target.value)}
                                disabled={disabled}
                                aria-label="Payment Date"
                                required
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={editedPayment.amount}
                                onChange={(e) => handleEditChange('amount', e.target.value)}
                                min="0.01"
                                step="0.01"
                                disabled={disabled}
                                placeholder="0.00"
                                aria-label="Payment Amount"
                                required
                              />
                            </td>
                            <td>
                              <select
                                value={editedPayment.method}
                                onChange={(e) => handleEditChange('method', e.target.value)}
                                disabled={disabled}
                                aria-label="Payment Method"
                              >
                                {validMethods.map((method) => (
                                  <option key={method} value={method}>
                                    {method}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                value={editedPayment.note}
                                onChange={(e) => handleEditChange('note', e.target.value)}
                                disabled={disabled}
                                placeholder="e.g., Initial payment"
                                aria-label="Payment Note"
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={editedPayment.isPaid}
                                onChange={(e) => handleEditChange('isPaid', e.target.checked)}
                                disabled={disabled}
                                aria-label="Payment Status"
                              />
                              {editedPayment.isPaid ? ' Paid' : ' Due'}
                            </td>
                            <td className={styles.actionsCell}>
                              <button
                                onClick={() => saveEdit(index)}
                                className={styles.saveButton}
                                title="Save Edit"
                                disabled={disabled || !editedPayment.amount}
                                aria-label="Save Edit"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className={styles.cancelButton}
                                title="Cancel Edit"
                                disabled={disabled}
                                aria-label="Cancel Edit"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={index}
                            className={
                              payment.isPaid
                                ? styles.paid
                                : payment.date.split('T')[0] < new Date().toISOString().split('T')[0]
                                ? styles.overdue
                                : ''
                            }
                          >
                            <td>
                              {new Date(payment.date).toLocaleDateString()}
                              {index === 0 && payment.note === 'Deposit payment' && (
                                <span className={styles.depositIndicator}> (Deposit)</span>
                              )}
                            </td>
                            <td>${(parseFloat(payment.amount) || 0).toFixed(2)}</td>
                            <td>{payment.method}</td>
                            <td>{payment.note || '-'}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={payment.isPaid}
                                onChange={() => togglePaymentStatus(index)}
                                disabled={disabled}
                                aria-label={`Toggle ${payment.isPaid ? 'Paid' : 'Due'} Status`}
                              />
                              {payment.isPaid ? ' Paid' : ' Due'}
                            </td>
                            {!disabled && (
                              <td className={styles.actionsCell}>
                                <button
                                  onClick={() => startEditing(index)}
                                  className={styles.editButton}
                                  title="Edit Payment"
                                  aria-label="Edit Payment"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => removePayment(index)}
                                  className={styles.removeButton}
                                  title="Remove Payment"
                                  aria-label="Remove Payment"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>

          {!disabled && (
            <div className={styles.newPayment}>
              <div className={styles.subSectionHeader}>
                <button
                  className={styles.toggleButton}
                  onClick={() => toggleSection('addPayment')}
                  title={expandedSections.addPayment ? 'Collapse' : 'Expand'}
                  aria-expanded={expandedSections.addPayment}
                >
                  <i
                    className={`fas ${
                      expandedSections.addPayment ? 'fa-chevron-down' : 'fa-chevron-right'
                    }`}
                  ></i>
                </button>
                <h4>Add Payment</h4>
              </div>
              {expandedSections.addPayment && (
                <div>
                  {error && (
                    <div className={styles.errorMessage} role="alert">
                      <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                  )}
                  <div className={styles.field}>
                    <label>Date:</label>
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => handleNewPaymentChange('date', e.target.value)}
                      disabled={disabled}
                      aria-label="Payment Date"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Amount ($):</label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => handleNewPaymentChange('amount', e.target.value)}
                      min="0.01"
                      step="0.01"
                      disabled={disabled}
                      placeholder="0.00"
                      aria-label="Payment Amount"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Method:</label>
                    <select
                      value={newPayment.method}
                      onChange={(e) => handleNewPaymentChange('method', e.target.value)}
                      disabled={disabled}
                      aria-label="Payment Method"
                    >
                      {validMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Note:</label>
                    <input
                      type="text"
                      value={newPayment.note}
                      onChange={(e) => handleNewPaymentChange('note', e.target.value)}
                      disabled={disabled}
                      placeholder="e.g., Initial payment"
                      aria-label="Payment Note"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Paid:</label>
                    <input
                      type="checkbox"
                      checked={newPayment.isPaid}
                      onChange={(e) => handleNewPaymentChange('isPaid', e.target.checked)}
                      disabled={disabled}
                      aria-label="Payment Status"
                    />
                  </div>
                  <button
                    onClick={addPayment}
                    className={styles.addButton}
                    disabled={disabled || !newPayment.amount || parseFloat(newPayment.amount) < 0.01}
                    aria-label="Add Payment"
                  >
                    <i className="fas fa-plus"></i> Add Payment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}