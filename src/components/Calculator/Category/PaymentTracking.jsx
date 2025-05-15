//src/components/Calculator/PaymentTracking/PaymentTracking.jsx

import React, { useState, useMemo } from 'react';
import { calculateTotal } from '../calculations/costCalculations';
import styles from './PaymentTracking.module.css';

export default function PaymentTracking({ settings, setSettings, categories, disabled = false }) {
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'Cash',
    note: '',
    isPaid: false,
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedPayment, setEditedPayment] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    paymentTracking: true,
    paymentEntries: true,
    addPayment: false,
  });
  const [error, setError] = useState(null);

  const totals = useMemo(() => {
    console.log('Categories input:', JSON.stringify(categories, null, 2));
    const result = calculateTotal(
      categories,
      settings.taxRate || 0,
      settings.transportationFee || 0,
      settings.wasteFactor || 0,
      settings.miscFees || [],
      settings.markup || 0,
      settings.laborDiscount || 0
    );
    console.log('Totals output:', JSON.stringify(result, null, 2));
    return {
      ...result,
      total: result.total || 0,
      materialCost: result.materialCost || 0,
      laborCost: result.laborCost || 0,
      laborDiscount: result.laborDiscount || 0,
    };
  }, [categories, settings]);

  const grandTotal = totals.total;
  const totalPaid = useMemo(() => {
    const paidSum = (settings.payments || []).reduce((sum, payment) => sum + (payment.isPaid ? parseFloat(payment.amount) || 0 : 0), 0);
    const deposit = parseFloat(settings.deposit) || 0;
    return paidSum + deposit;
  }, [settings.payments, settings.deposit]);

  const amountRemaining = Math.max(0, grandTotal - totalPaid);
  const amountDue = (settings.payments || []).reduce((sum, payment) => sum + (!payment.isPaid ? parseFloat(payment.amount) || 0 : 0), 0);
  const overduePayments = (settings.payments || []).filter(
    (payment) => !payment.isPaid && new Date(payment.date) < new Date()
  ).reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  const overpaid = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const toggleSection = (section) => {
    console.log('Toggling section:', section, 'Current expandedSections:', expandedSections);
    setExpandedSections((prev) => {
      const newSections = { ...prev, [section]: !prev[section] };
      console.log('New expandedSections:', newSections);
      setError(null); // Clear error when toggling
      return newSections;
    });
  };

  const validatePayment = (payment) => {
    if (!payment.date || isNaN(Date.parse(payment.date))) {
      return 'Please select a valid date.';
    }
    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount <= 0) {
      return 'Payment amount must be greater than zero.';
    }
    return null;
  };

  const handleSettingsChange = (field, value) => {
    if (disabled) return;
    setSettings((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleNewPaymentChange = (field, value) => {
    setNewPayment((prev) => ({ ...prev, [field]: value }));
  };

  const addPayment = () => {
    if (disabled) return;

    const validationError = validatePayment(newPayment);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payment = {
        date: new Date(newPayment.date).toISOString(),
        amount: parseFloat(newPayment.amount),
        method: newPayment.method,
        note: newPayment.note.trim(),
        isPaid: newPayment.isPaid,
      };
      console.log('Adding payment:', JSON.stringify(payment, null, 2));
      setSettings((prev) => {
        const updatedPayments = [...(prev.payments || []), payment];
        const updatedSettings = { ...prev, payments: updatedPayments };
        console.log('Updated settings after adding payment:', JSON.stringify(updatedSettings, null, 2));
        return updatedSettings;
      });
      setNewPayment({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: 'Cash',
        note: '',
        isPaid: false,
      });
      setExpandedSections((prev) => {
        const newSections = { ...prev, addPayment: false };
        console.log('New expandedSections after addPayment:', newSections);
        return newSections;
      });
      setError(null);
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Failed to add payment. Please try again.');
    }
  };

  const togglePaymentStatus = (index) => {
    if (disabled) return;
    try {
      setSettings((prev) => {
        const updatedPayments = prev.payments.map((payment, i) =>
          i === index ? { ...payment, isPaid: !payment.isPaid } : payment
        );
        console.log('Toggled payment status at index', index, ':', JSON.stringify(updatedPayments, null, 2));
        return { ...prev, payments: updatedPayments };
      });
    } catch (err) {
      console.error('Error toggling payment status:', err);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const removePayment = (index) => {
    if (disabled) return;
    try {
      setSettings((prev) => {
        const updatedPayments = prev.payments.filter((_, i) => i !== index);
        console.log('Removed payment at index', index, ':', JSON.stringify(updatedPayments, null, 2));
        return { ...prev, payments: updatedPayments };
      });
    } catch (err) {
      console.error('Error removing payment:', err);
      setError('Failed to remove payment. Please try again.');
    }
  };

  const startEditing = (index) => {
    if (disabled) return;
    const payment = settings.payments[index];
    setEditingIndex(index);
    setEditedPayment({
      ...payment,
      date: new Date(payment.date).toISOString().split('T')[0],
    });
    setError(null);
  };

  const handleEditChange = (field, value) => {
    setEditedPayment((prev) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || '' : value,
    }));
  };

  const saveEdit = (index) => {
    if (disabled) return;

    const validationError = validatePayment(editedPayment);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSettings((prev) => {
        const updatedPayments = prev.payments.map((payment, i) =>
          i === index
            ? { ...editedPayment, date: new Date(editedPayment.date).toISOString(), amount: parseFloat(editedPayment.amount) }
            : payment
        );
        console.log('Saved edited payment at index', index, ':', JSON.stringify(updatedPayments, null, 2));
        return { ...prev, payments: updatedPayments };
      });
      setEditingIndex(null);
      setEditedPayment(null);
      setError(null);
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment. Please try again.');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditedPayment(null);
    setError(null);
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
          <div className={styles.field}>
            <label>
              <i className="fas fa-hand-holding-usd"></i> Deposit ($):
            </label>
            <input
              type="number"
              value={settings.deposit || ''}
              onChange={(e) => handleSettingsChange('deposit', e.target.value)}
              min="0"
              step="0.01"
              disabled={disabled}
              aria-label="Deposit Amount"
            />
          </div>

          <div className={styles.summary}>
            <p><strong>Grand Total:</strong> ${grandTotal.toFixed(2)}</p>
            <p><strong>Material Cost:</strong> ${totals.materialCost.toFixed(2)}</p>
            <p><strong>Labor Cost (after discount):</strong> ${totals.laborCost.toFixed(2)}</p>
            {totals.laborDiscount > 0 && (
              <p><strong>Labor Discount:</strong> -${totals.laborDiscount.toFixed(2)}</p>
            )}
            <p><strong>Deposit:</strong> ${(settings.deposit || 0).toFixed(2)}</p>
            <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>
            <p><strong>Amount Remaining:</strong> ${amountRemaining.toFixed(2)}</p>
            <p><strong>Amount Due:</strong> ${amountDue.toFixed(2)}</p>
            {overduePayments > 0 && (
              <p className={styles.overdue}><strong>Overdue:</strong> ${overduePayments.toFixed(2)}</p>
            )}
            {overpaid > 0 && (
              <p className={styles.overdue}><strong>Overpaid by:</strong> ${overpaid.toFixed(2)}</p>
            )}
          </div>

          {/* Payment Entries Section */}
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
                {(settings.payments || []).length === 0 ? (
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
                      {(settings.payments || []).map((payment, index) => (
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
                                <option value="Cash">Cash</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                                <option value="Check">Check</option>
                                <option value="Zelle">Zelle</option>
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
                                : new Date(payment.date) < new Date()
                                ? styles.overdue
                                : ''
                            }
                          >
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
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

          {/* Add Payment Section */}
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
                      {error}
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
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                      <option value="Check">Check</option>
                      <option value="Zelle">Zelle</option>
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
                    disabled={disabled || !newPayment.amount || parseFloat(newPayment.amount) <= 0}
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