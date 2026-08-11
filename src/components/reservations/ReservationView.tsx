import React, { useState } from 'react';
import { Reservation, RestaurantTable } from '../../types';
import { Calendar, Plus, Clock, Users, CheckCircle2, XCircle } from 'lucide-react';

interface ReservationViewProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  onAddReservation: (res: Reservation) => void;
  onUpdateReservationStatus: (resId: string, status: Reservation['status']) => void;
  isDarkMode: boolean;
}

export const ReservationView: React.FC<ReservationViewProps> = ({
  reservations,
  tables,
  onAddReservation,
  onUpdateReservationStatus,
  isDarkMode
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newRes, setNewRes] = useState<Partial<Reservation>>({
    customerName: '',
    phone: '',
    guestsCount: 2,
    reservationDate: new Date().toISOString().split('T')[0],
    reservationTime: '19:00',
    area: 'Main Hall',
    status: 'Pending'
  });

  const handleSave = () => {
    if (newRes.customerName && newRes.phone) {
      const res: Reservation = {
        id: 'res-' + Date.now(),
        customerName: newRes.customerName,
        phone: newRes.phone,
        guestsCount: Number(newRes.guestsCount) || 2,
        reservationDate: newRes.reservationDate || new Date().toISOString().split('T')[0],
        reservationTime: newRes.reservationTime || '19:00',
        area: newRes.area || 'Main Hall',
        status: 'Confirmed'
      };
      onAddReservation(res);
      setShowModal(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Table Booking & Reservations</h1>
            <p className="text-muted small mb-0">Manage walk-in bookings, online reservations, and seating allocations</p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary d-flex align-items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      <div className="row g-3">
        {reservations.map((r) => (
          <div key={r.id} className="col-12 col-md-6 col-xl-4">
            <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-primary">{r.reservationDate} @ {r.reservationTime}</span>
                <span className={`badge ${
                  r.status === 'Confirmed' ? 'bg-success' :
                  r.status === 'Seated' ? 'bg-info text-dark' : 'bg-warning text-dark'
                }`}>
                  {r.status}
                </span>
              </div>

              <h5 className="fw-bold mb-1">{r.customerName}</h5>
              <div className="small text-muted mb-2">Tel: {r.phone} | Area: {r.area} ({r.guestsCount} Guests)</div>

              <div className="d-flex gap-2 mt-3 pt-2 border-top">
                <button
                  onClick={() => onUpdateReservationStatus(r.id, 'Seated')}
                  className="btn btn-sm btn-success flex-grow-1"
                >
                  Seat Guests
                </button>
                <button
                  onClick={() => onUpdateReservationStatus(r.id, 'Cancelled')}
                  className="btn btn-sm btn-outline-danger"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold">New Table Reservation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Customer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRes.customerName || ''}
                      onChange={(e) => setNewRes({ ...newRes, customerName: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newRes.phone || ''}
                      onChange={(e) => setNewRes({ ...newRes, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Guests Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newRes.guestsCount || 2}
                      onChange={(e) => setNewRes({ ...newRes, guestsCount: parseInt(e.target.value) || 2 })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm fw-bold" onClick={handleSave}>Confirm Reservation</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
