import React, { useState } from 'react';
import { OrderItem, RestaurantSettings } from '../../types';
import { Split, Users, DollarSign, Check } from 'lucide-react';

interface SplitBillModalProps {
  totalAmount: number;
  cartItems: OrderItem[];
  settings: RestaurantSettings;
  onClose: () => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  totalAmount,
  cartItems,
  settings,
  onClose
}) => {
  const [splitGuests, setSplitGuests] = useState<number>(2);

  const amountPerGuest = totalAmount / (splitGuests || 1);

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
          
          <div className="modal-header bg-primary text-white p-3">
            <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
              <Split className="w-5 h-5" />
              <span>Split Bill Calculator</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 text-center">
            
            <div className="card bg-light border-0 p-3 mb-4 rounded-3">
              <div className="text-muted small fw-semibold">TOTAL BILL AMOUNT</div>
              <h2 className="display-6 fw-bold text-primary mb-0">{settings.currencySymbol}{totalAmount.toFixed(2)}</h2>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-muted">NUMBER OF GUESTS SPLITTING</label>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  onClick={() => setSplitGuests(Math.max(2, splitGuests - 1))}
                  className="btn btn-outline-secondary btn-lg fw-bold px-3"
                >
                  -
                </button>

                <div className="display-6 fw-bold px-4 font-monospace">{splitGuests}</div>

                <button
                  onClick={() => setSplitGuests(splitGuests + 1)}
                  className="btn btn-outline-secondary btn-lg fw-bold px-3"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-success-subtle text-success border border-success-subtle rounded-3">
              <div className="small fw-semibold text-uppercase">Each Guest Pays</div>
              <h3 className="fw-bold mb-0">{settings.currencySymbol}{amountPerGuest.toFixed(2)}</h3>
            </div>

          </div>

          <div className="modal-footer bg-light p-3">
            <button className="btn btn-primary w-100 fw-semibold" onClick={onClose}>
              Done Split Calculation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
