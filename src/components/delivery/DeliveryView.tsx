import React from 'react';
import { DeliveryDriver, Order } from '../../types';
import { Truck, Phone, Navigation, CheckCircle2, UserCheck } from 'lucide-react';

interface DeliveryViewProps {
  drivers: DeliveryDriver[];
  deliveryOrders: Order[];
  isDarkMode: boolean;
}

export const DeliveryView: React.FC<DeliveryViewProps> = ({
  drivers,
  deliveryOrders,
  isDarkMode
}) => {
  return (
    <div className="container-fluid p-4">
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-info text-white rounded-3 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Delivery Dispatch & Driver Management</h1>
            <p className="text-muted small mb-0">Track active tuktuk / motorcycle drivers and delivery zone orders</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* Driver Roster */}
        <div className="col-12 col-md-4">
          <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            <h5 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Registered Drivers Roster</span>
            </h5>

            <div className="list-group list-group-flush">
              {drivers.map((drv) => (
                <div key={drv.id} className="list-group-item px-0 py-2 bg-transparent border-bottom">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold small">{drv.name}</span>
                    <span className={`badge ${drv.status === 'Available' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {drv.status}
                    </span>
                  </div>
                  <div className="small text-muted">{drv.vehicleType} | Tel: {drv.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Orders */}
        <div className="col-12 col-md-8">
          <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
            <h5 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
              <Navigation className="w-4 h-4 text-success" />
              <span>Active Delivery Orders</span>
            </h5>

            <div className="row g-3">
              {deliveryOrders.map((ord) => (
                <div key={ord.id} className="col-12 col-md-6">
                  <div className="card border p-3 rounded-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold text-primary font-monospace">{ord.orderNumber}</span>
                      <span className="badge bg-success">${ord.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="fw-bold small">{ord.customerName}</div>
                    <div className="small text-muted mb-2">{ord.customerAddress || 'Mogadishu KM4 Zone'}</div>

                    <div className="p-2 bg-light rounded small mb-2 font-monospace">
                      Phone: {ord.customerPhone || '+252 61 772 1100'}
                    </div>

                    <button className="btn btn-sm btn-outline-primary w-100 fw-semibold">
                      Assign Driver Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
