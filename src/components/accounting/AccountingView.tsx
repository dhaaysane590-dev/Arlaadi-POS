import React, { useState } from 'react';
import { Expense, DailyClosing, PaymentMethod, RestaurantSettings } from '../../types';
import { Calculator, Plus, DollarSign, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';

interface AccountingViewProps {
  expenses: Expense[];
  dailyClosing: DailyClosing;
  settings: RestaurantSettings;
  onAddExpense: (exp: Expense) => void;
  isDarkMode: boolean;
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  expenses,
  dailyClosing,
  settings,
  onAddExpense,
  isDarkMode
}) => {
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(50);
  const [expenseCat, setExpenseCat] = useState<Expense['category']>('Ingredients');

  // Daily Closing Interactive Form
  const [actualCash, setActualCash] = useState<number>(dailyClosing.actualCashInHand);
  const [isClosed, setIsClosed] = useState<boolean>(false);

  const expectedCash = dailyClosing.openingCash + dailyClosing.cashSales;
  const variance = actualCash - expectedCash;

  const handleSaveExpense = () => {
    if (expenseTitle && expenseAmount > 0) {
      const exp: Expense = {
        id: 'exp-' + Date.now(),
        category: expenseCat,
        title: expenseTitle,
        amount: expenseAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'EVC Plus',
        recordedBy: 'Accountant'
      };
      onAddExpense(exp);
      setShowExpenseModal(false);
      setExpenseTitle('');
    }
  };

  return (
    <div className="container-fluid p-4">
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-dark text-white rounded-3 shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Financial Accounting & Daily Register Closing</h1>
            <p className="text-muted small mb-0">Expense log, cash drawer Z-reports, and register reconciliation</p>
          </div>
        </div>

        <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      <div className="row g-4">
        
        {/* Daily Cash Register Z-Report */}
        <div className="col-12 col-lg-5">
          <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            <h5 className="h6 fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <Receipt className="w-5 h-5" />
              <span>Daily Cash Register Z-Report ({dailyClosing.date})</span>
            </h5>

            <div className="bg-light p-3 rounded-3 mb-3 font-monospace small">
              <div className="d-flex justify-content-between mb-2">
                <span>Opening Cash Float:</span>
                <span className="fw-bold">${dailyClosing.openingCash.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>+ Cash Sales Today:</span>
                <span className="fw-bold">${dailyClosing.cashSales.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-primary">
                <span>• Card Sales Today:</span>
                <span className="fw-bold">${dailyClosing.cardSales.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-info">
                <span>• Mobile Money Sales:</span>
                <span className="fw-bold">${dailyClosing.mobileMoneySales.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between fw-bold h6 border-top pt-2 mt-2 text-dark">
                <span>EXPECTED CASH IN DRAWER:</span>
                <span className="text-primary">${expectedCash.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Counted Physical Cash in Drawer ($)</label>
              <input
                type="number"
                step="0.5"
                className="form-control form-control-lg font-monospace fw-bold"
                value={actualCash}
                onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
              />
            </div>

            {variance !== 0 ? (
              <div className={`alert ${variance < 0 ? 'alert-danger' : 'alert-success'} p-2.5 small fw-bold mb-3`}>
                Variance: ${variance.toFixed(2)} ({variance < 0 ? 'Shortage' : 'Overage'})
              </div>
            ) : (
              <div className="alert alert-success p-2.5 small fw-bold mb-3 d-flex align-items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Register Cash Balanced Perfectly!</span>
              </div>
            )}

            <button
              onClick={() => {
                setIsClosed(true);
                alert('Daily Register Z-Report Closed & Audited!');
              }}
              disabled={isClosed}
              className="btn btn-success w-100 fw-bold py-2.5 shadow-sm"
            >
              {isClosed ? 'Register Closed for Today' : 'Reconcile & Close Cash Register'}
            </button>
          </div>
        </div>

        {/* Expenses Log */}
        <div className="col-12 col-lg-7">
          <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            <h5 className="h6 fw-bold mb-3">Expenses Record</h5>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Category & Title</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Recorded By</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <div className="fw-bold small">{exp.title}</div>
                        <span className="badge bg-light text-dark border style-badge">{exp.category}</span>
                      </td>

                      <td className="font-monospace small">{exp.date}</td>
                      <td className="small">{exp.paymentMethod}</td>
                      <td className="small text-muted">{exp.recordedBy}</td>
                      <td className="text-end fw-bold font-monospace text-danger">-${exp.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {showExpenseModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title h6 fw-bold">Record Expense</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowExpenseModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Expense Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Utility bill, Diesel for generator"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Category</label>
                  <select
                    className="form-select"
                    value={expenseCat}
                    onChange={(e) => setExpenseCat(e.target.value as any)}
                  >
                    <option value="Ingredients">Ingredients</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Rent">Rent</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Amount ($)</label>
                  <input
                    type="number"
                    step="1"
                    className="form-control font-monospace fw-bold"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm fw-bold" onClick={handleSaveExpense}>Save Expense</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
