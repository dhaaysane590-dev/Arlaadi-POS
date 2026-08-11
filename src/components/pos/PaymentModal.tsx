import React, { useState } from 'react';
import { PaymentMethod, Order, RestaurantSettings } from '../../types';
import {
  CreditCard,
  DollarSign,
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  Printer,
  ShieldAlert
} from 'lucide-react';

interface PaymentModalProps {
  orderTotal: number;
  customerPhone?: string;
  settings: RestaurantSettings;
  onConfirmPayment: (method: PaymentMethod, paidAmount: number, changeAmount: number, phone?: string) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  orderTotal,
  customerPhone = '',
  settings,
  onConfirmPayment,
  onClose
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [phone, setPhone] = useState<string>(customerPhone || '+252 61 500 1234');
  const [cashTendered, setCashTendered] = useState<number>(Math.ceil(orderTotal));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  const changeAmount = Math.max(0, cashTendered - orderTotal);

  const handleProcessPayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccessMessage(`Payment of $${orderTotal.toFixed(2)} successfully approved via ${selectedMethod}!`);

      setTimeout(() => {
        onConfirmPayment(selectedMethod, cashTendered, changeAmount, phone);
      }, 1200);
    }, 1500);
  };

  const isMobileMoney = ['EVC Plus', 'E-Dahab', 'Mycash', 'Merchant', 'ZAAD', 'Sahal', 'Premier Wallet'].includes(selectedMethod);

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          
          <div className="modal-header bg-dark text-white p-3">
            <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              <span>Complete Payment - Total: {settings.currencySymbol}{orderTotal.toFixed(2)}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            
            {/* Payment Method Selector Grid */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">Select Payment Method</label>
              
              <div className="row g-2">
                {[
                  { id: 'Cash', label: 'Cash Payment', icon: DollarSign, color: 'border-success text-success bg-success-subtle' },
                  { id: 'EVC Plus', label: 'EVC Plus (Hormuud)', icon: Smartphone, color: 'border-primary text-primary bg-primary-subtle' },
                  { id: 'E-Dahab', label: 'E-Dahab (Somtel)', icon: Smartphone, color: 'border-warning text-dark bg-warning-subtle' },
                  { id: 'Mycash', label: 'Mycash (Salaam Bank)', icon: Smartphone, color: 'border-info text-info bg-info-subtle' },
                  { id: 'Merchant', label: 'Merchant Code', icon: Smartphone, color: 'border-secondary text-secondary bg-light' },
                  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard, color: 'border-purple text-purple bg-purple-subtle' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = selectedMethod === m.id;

                  return (
                    <div key={m.id} className="col-6 col-md-4">
                      <button
                        onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                        className={`btn w-100 p-3 text-start rounded-3 border-2 d-flex flex-column align-items-start justify-content-between transition-all ${
                          isSelected ? `${m.color} shadow-sm fw-bold` : 'btn-outline-light text-dark border-light-subtle'
                        }`}
                        style={{ height: '80px' }}
                      >
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <Icon className="w-5 h-5" />
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-success" />}
                        </div>
                        <span className="small">{m.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Method-Specific Input Options */}
            {selectedMethod === 'Cash' && (
              <div className="card bg-light border-0 p-3 rounded-3 mb-3">
                <div>
                  <label className="form-label small fw-semibold">Cash Tendered ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-lg font-monospace fw-bold text-success bg-white"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  />
                  <div className="form-text small text-muted mt-1">
                    Receipt total: <span className="fw-bold font-monospace text-dark">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Live Success Banner */}
            {paymentSuccessMessage && (
              <div className="alert alert-success border-success d-flex align-items-center gap-2 mb-0">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="fw-semibold small">{paymentSuccessMessage}</span>
              </div>
            )}

          </div>

          <div className="modal-footer bg-light p-3 d-flex align-items-center justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing || (selectedMethod === 'Cash' && cashTendered < orderTotal)}
              className="btn btn-success px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Gateway...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Approve & Print Receipt ({settings.currencySymbol}{orderTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
