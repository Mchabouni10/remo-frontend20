import React, { useState, useMemo } from 'react';
import styles from './PaymentTracking.module.css';
import { calculateTotal } from '../calculations/costCalculations';

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
  const [expandedSections, setExpandedSections] = useState(new Set(['paymentTracking', 'paymentEntries'])); // Default: "Payment Tracking" and "Payment Entries" expanded

  const grandTotal = useMemo(() => {
    return calculateTotal(
      categories,
      settings.taxRate || 0,
      settings.transportationFee || 0,
      settings.wasteFactor || 0,
      settings.miscFees || [],
      settings.markup || 0
    ).total;
  }, [categories, settings]);

  const totalPaid = useMemo(() => {
    return (settings.payments || []).reduce((sum, payment) => sum + (payment.isPaid ? payment.amount : 0), 0) + (settings.deposit || 0);
  }, [settings.payments, settings.deposit]);

  const amountRemaining = Math.max(0, grandTotal - totalPaid);
  const amountDue = (settings.payments || []).reduce((sum, payment) => sum + (!payment.isPaid ? payment.amount : 0), 0);
  const overduePayments = (settings.payments || []).filter(
    (payment) => !payment.isPaid && new Date(payment.date) < new Date()
  ).reduce((sum, payment) => sum + payment.amount, 0);

  const overpaid = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

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
    if (disabled || !newPayment.amount || isNaN(newPayment.amount)) return;
    const payment = {
      date: newPayment.date,
      amount: parseFloat(newPayment.amount) || 0,
      method: newPayment.method,
      note: newPayment.note.trim(),
      isPaid: newPayment.isPaid,
    };
    console.log('Adding payment:', JSON.stringify(payment, null, 2));
    setSettings((prev) => {
      const updatedSettings = {
        ...prev,
        payments: [...(prev.payments || []), payment],
      };
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
  };

  const togglePaymentStatus = (index) => {
    if (disabled) return;
    setSettings((prev) => {
      const updatedPayments = prev.payments.map((payment, i) =>
        i === index ? { ...payment, isPaid: !payment.isPaid } : payment
      );
      console.log('Toggled payment status at index', index, ':', JSON.stringify(updatedPayments, null, 2));
      return { ...prev, payments: updatedPayments };
    });
  };

  const removePayment = (index) => {
    if (disabled) return;
    setSettings((prev) => {
      const updatedPayments = prev.payments.filter((_, i) => i !== index);
      console.log('Removed payment at index', index, ':', JSON.stringify(updatedPayments, null, 2));
      return { ...prev, payments: updatedPayments };
    });
  };

  const startEditing = (index) => {
    if (disabled) return;
    setEditingIndex(index);
    setEditedPayment({ ...settings.payments[index] });
  };

  const handleEditChange = (field, value) => {
    setEditedPayment((prev) => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const saveEdit = (index) => {
    if (disabled || !editedPayment.amount || isNaN(editedPayment.amount)) return;
    setSettings((prev) => {
      const updatedPayments = prev.payments.map((payment, i) =>
        i === index ? { ...editedPayment } : payment
      );
      console.log('Saved edited payment at index', index, ':', JSON.stringify(updatedPayments, null, 2));
      return { ...prev, payments: updatedPayments };
    });
    setEditingIndex(null);
    setEditedPayment(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditedPayment(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      newSet.has(section) ? newSet.delete(section) : newSet.add(section);
      return newSet;
    });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => toggleSection('paymentTracking')}
          title={expandedSections.has('paymentTracking') ? 'Collapse' : 'Expand'}
        >
          <i
            className={`fas ${
              expandedSections.has('paymentTracking') ? 'fa-chevron-down' : 'fa-chevron-right'
            }`}
          ></i>
        </button>
        <h3 className={styles.sectionTitle}>
          <i className="fas fa-wallet"></i> Payment Tracking
        </h3>
      </div>
      {expandedSections.has('paymentTracking') && (
        <div className={styles.settingsContent}>
          <div className={styles.field}>
            <label>
              <i className="fas fa-hand-holding-usd"></i> Deposit ($):
            </label>
            <input
              type="number"
              value={settings.deposit || 0}
              onChange={(e) => handleSettingsChange('deposit', e.target.value)}
              min="0"
              disabled={disabled}
            />
          </div>

          <div className={styles.summary}>
            <p><strong>Grand Total:</strong> ${grandTotal.toFixed(2)}</p>
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
                title={expandedSections.has('paymentEntries') ? 'Collapse' : 'Expand'}
              >
                <i
                  className={`fas ${
                    expandedSections.has('paymentEntries') ? 'fa-chevron-down' : 'fa-chevron-right'
                  }`}
                ></i>
              </button>
              <h4>Payment Entries</h4>
            </div>
            {expandedSections.has('paymentEntries') && (
              <>
                {(settings.payments || []).length === 0 ? (
                  <p>No payments recorded yet.</p>
                ) : (
                  <table className={styles.paymentTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Note</th>
                        <th>Status</th>
                        {!disabled && <th>Actions</th>}
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
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={editedPayment.amount}
                                onChange={(e) => handleEditChange('amount', e.target.value)}
                                min="0"
                                placeholder="0.00"
                              />
                            </td>
                            <td>
                              <select
                                value={editedPayment.method}
                                onChange={(e) => handleEditChange('method', e.target.value)}
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
                                placeholder="e.g., Initial payment"
                              />
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                checked={editedPayment.isPaid}
                                onChange={(e) => handleEditChange('isPaid', e.target.checked)}
                              />
                              {editedPayment.isPaid ? ' Paid' : ' Due'}
                            </td>
                            <td className={styles.actionsCell}>
                              <button
                                onClick={() => saveEdit(index)}
                                className={styles.saveButton}
                                title="Save Edit"
                                disabled={!editedPayment.amount}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className={styles.cancelButton}
                                title="Cancel Edit"
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
                            <td>${payment.amount.toFixed(2)}</td>
                            <td>{payment.method}</td>
                            <td>{payment.note || '-'}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={payment.isPaid}
                                onChange={() => togglePaymentStatus(index)}
                                disabled={disabled}
                              />
                              {payment.isPaid ? ' Paid' : ' Due'}
                            </td>
                            {!disabled && (
                              <td className={styles.actionsCell}>
                                <button
                                  onClick={() => startEditing(index)}
                                  className={styles.editButton}
                                  title="Edit Payment"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => removePayment(index)}
                                  className={styles.removeButton}
                                  title="Remove Payment"
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
                  title={expandedSections.has('addPayment') ? 'Collapse' : 'Expand'}
                >
                  <i
                    className={`fas ${
                      expandedSections.has('addPayment') ? 'fa-chevron-down' : 'fa-chevron-right'
                    }`}
                  ></i>
                </button>
                <h4>Add Payment</h4>
              </div>
              {expandedSections.has('addPayment') && (
                <div>
                  <div className={styles.field}>
                    <label>Date:</label>
                    <input
                      type="date"
                      value={newPayment.date}
                      onChange={(e) => handleNewPaymentChange('date', e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Amount ($):</label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => handleNewPaymentChange('amount', e.target.value)}
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Method:</label>
                    <select
                      value={newPayment.method}
                      onChange={(e) => handleNewPaymentChange('method', e.target.value)}
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
                      placeholder="e.g., Initial payment"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Paid:</label>
                    <input
                      type="checkbox"
                      checked={newPayment.isPaid}
                      onChange={(e) => handleNewPaymentChange('isPaid', e.target.checked)}
                    />
                  </div>
                  <button
                    onClick={addPayment}
                    className={styles.addButton}
                    disabled={!newPayment.amount}
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