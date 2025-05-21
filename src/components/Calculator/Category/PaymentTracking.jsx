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
    const result = calculateTotal(
      categories,
      settings.taxRate || 0,
      settings.transportationFee || 0,
      settings.wasteFactor || 0,
      settings.miscFees || [],
      settings.markup || 0,
      settings.laborDiscount || 0
    );
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
    const payments = Array.isArray(settings.payments) ? settings.payments : [];
    return payments.reduce((sum, payment) => sum + (payment.isPaid ? parseFloat(payment.amount) || 0 : 0), 0) +
           (parseFloat(settings.deposit) || 0);
  }, [settings.payments, settings.deposit]);

  const amountRemaining = Math.max(0, grandTotal - totalPaid);
  const amountDue = (settings.payments || []).reduce((sum, payment) => sum + (!payment.isPaid ? parseFloat(payment.amount) || 0 : 0), 0);
  const overduePayments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (Array.isArray(settings.payments) ? settings.payments : []).filter(
      (payment) => !payment.isPaid && payment.date.split('T')[0] < today
    ).reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  }, [settings.payments]);

  const overpaid = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    setError(null);
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
      setSettings((prev) => ({
        ...prev,
        payments: [...(prev.payments || []), payment],
      }));
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
    } catch (err) {
      console.error('Error adding payment:', err);
      setError('Failed to add payment. Please try again.');
    }
  };

  const togglePaymentStatus = (index) => {
    if (disabled) return;
    try {
      setSettings((prev) => ({
        ...prev,
        payments: prev.payments.map((payment, i) =>
          i === index ? { ...payment, isPaid: !payment.isPaid } : payment
        ),
      }));
    } catch (err) {
      console.error('Error toggling payment status:', err);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const removePayment = (index) => {
    if (disabled) return;
    try {
      setSettings((prev) => ({
        ...prev,
        payments: prev.payments.filter((_, i) => i !== index),
      }));
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
      setSettings((prev) => ({
        ...prev,
        payments: prev.payments.map((payment, i) =>
          i === index
            ? { ...editedPayment, date: new Date(editedPayment.date).toISOString(), amount: parseFloat(editedPayment.amount) }
            : payment
        ),
      }));
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
          {error && (
            <div className={styles.errorMessage} role="alert">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}
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
                                : payment.date.split('T')[0] < new Date().toISOString().split('T')[0]
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