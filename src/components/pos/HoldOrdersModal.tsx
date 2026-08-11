import React from 'react';
import { Order } from '../../types';
import { PauseCircle, PlayCircle, Trash2, Clock } from 'lucide-react';

interface HoldOrdersModalProps {
  heldOrders: Order[];
  onResumeOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onClose: () => void;
}

export const HoldOrdersModal: React.FC<HoldOrdersModalProps> = ({
  heldOrders,
  onResumeOrder,
  onDeleteOrder,
  onClose
}) => {
  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3">
          
          <div className="modal-header bg-warning text-dark p-3 d-flex align-items-center justify-content-between">
            <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2 mb-0">
              <PauseCircle className="w-5 h-5" />
              <span>Held Orders Queue ({heldOrders.length})</span>
            </h5>
            <div className="d-flex align-items-center gap-2">
              {heldOrders.length > 0 && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline-danger fw-bold bg-white text-danger"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all held orders?')) {
                      heldOrders.forEach(o => onDeleteOrder(o.id));
                    }
                  }}
                >
                  Clear All Held
                </button>
              )}
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
          </div>

          <div className="modal-body p-3">
            {heldOrders.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <PauseCircle className="w-12 h-12 mb-2 stroke-1 text-secondary opacity-50" />
                <p className="mb-0">No held orders in queue.</p>
              </div>
            ) : (
              <div className="row g-3">
                {heldOrders.map((ord) => (
                  <div key={ord.id} className="col-12 col-md-6">
                    <div className="card h-100 border shadow-sm p-3 rounded-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold text-primary">{ord.orderNumber}</span>
                        <span className="badge bg-light text-dark border d-flex align-items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted" />
                          <span>{new Date(ord.createdAt).toLocaleTimeString()}</span>
                        </span>
                      </div>

                      <div className="small text-muted mb-2">
                        Customer: <strong className="text-dark">{ord.customerName}</strong> ({ord.orderType})
                      </div>

                      <div className="bg-light p-2 rounded mb-3" style={{ maxHeight: '100px', overflowY: 'auto', fontSize: '0.8rem' }}>
                        {ord.items.map(i => (
                          <div key={i.id} className="d-flex justify-content-between">
                            <span>{i.quantity}x {i.name}</span>
                            <span className="fw-semibold">${i.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                        <div className="fw-bold h6 mb-0 text-success">${ord.totalAmount.toFixed(2)}</div>

                        <div className="d-flex gap-2">
                          <button
                            onClick={() => onDeleteOrder(ord.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Discard"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onResumeOrder(ord)}
                            className="btn btn-sm btn-warning text-dark fw-semibold d-flex align-items-center gap-1"
                          >
                            <PlayCircle className="w-4 h-4" />
                            <span>Resume</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer bg-light p-2">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>

        </div>
      </div>
    </div>
  );
};
