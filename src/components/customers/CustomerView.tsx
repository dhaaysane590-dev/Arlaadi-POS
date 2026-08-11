import React, { useState } from 'react';
import { Customer } from '../../types';
import { Users, Search, Plus, Award, Wallet, Phone, Mail } from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  onTopUpWallet: (customerId: string, amount: number) => void;
  isDarkMode: boolean;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  onTopUpWallet,
  isDarkMode
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCustForWallet, setSelectedCustForWallet] = useState<Customer | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(50);

  const handleConfirmTopUp = () => {
    if (selectedCustForWallet && topUpAmount > 0) {
      onTopUpWallet(selectedCustForWallet.id, topUpAmount);
      alert(`Top-up of $${topUpAmount.toFixed(2)} added to ${selectedCustForWallet.name}'s wallet!`);
      setSelectedCustForWallet(null);
    }
  };

  return (
    <div className="container-fluid p-4">
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-success text-white rounded-3 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Customer Relationship & Loyalty Wallet</h1>
            <p className="text-muted small mb-0">Manage customer memberships, reward points, prepaid balances & preferences</p>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((c) => (
          <div key={c.id} className="col-12 col-md-6 col-xl-3">
            <div className={`card h-100 border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-primary-subtle text-primary fw-bold">{c.membershipLevel} VIP</span>
                <span className="badge bg-success text-white font-monospace">{c.loyaltyPoints} Points</span>
              </div>

              <h5 className="fw-bold mb-1">{c.name}</h5>
              <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{c.phone}</span>
              </div>

              <div className="bg-light p-2.5 rounded-3 mb-3">
                <div className="d-flex justify-content-between small text-muted">
                  <span>Prepaid Wallet:</span>
                  <strong className="text-success font-monospace">${c.walletBalance.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>Total Spent:</span>
                  <strong className="text-dark font-monospace">${c.totalSpent.toFixed(2)}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCustForWallet(c);
                  setTopUpAmount(50);
                }}
                className="btn btn-sm btn-outline-success w-100 d-flex align-items-center justify-content-center gap-1.5"
              >
                <Wallet className="w-4 h-4" />
                <span>Top Up Prepaid Wallet</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCustForWallet && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-success text-white p-3">
                <h5 className="modal-title h6 fw-bold">Top Up Wallet: {selectedCustForWallet.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedCustForWallet(null)}></button>
              </div>

              <div className="modal-body p-4">
                <label className="form-label small fw-semibold">Amount ($)</label>
                <input
                  type="number"
                  className="form-control form-control-lg font-monospace fw-bold"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedCustForWallet(null)}>Cancel</button>
                <button className="btn btn-success btn-sm fw-bold" onClick={handleConfirmTopUp}>Confirm Deposit</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
