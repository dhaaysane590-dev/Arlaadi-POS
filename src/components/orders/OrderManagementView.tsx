import React, { useState } from 'react';
import { Order, OrderStatus, RestaurantSettings, Employee } from '../../types';
import {
  Utensils,
  Search,
  Printer,
  RotateCcw,
  XCircle,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  Trash2,
  AlertTriangle,
  UtensilsCrossed,
  User,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { ReceiptModal } from '../pos/ReceiptModal';
import { triggerKotPrint } from '../../utils/printReceipt';

interface OrderManagementViewProps {
  orders: Order[];
  employees?: Employee[];
  settings: RestaurantSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onRefundOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  isDarkMode: boolean;
}

export const OrderManagementView: React.FC<OrderManagementViewProps> = ({
  orders,
  employees = [],
  settings,
  onUpdateOrderStatus,
  onRefundOrder,
  onDeleteOrder,
  isDarkMode
}) => {
  const [search, setSearch] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterWaiter, setFilterWaiter] = useState<string>('all');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Compile list of unique waiters
  const defaultWaiters = ['Mohamed Farah', 'Hassan Ali', 'Asha Omar', 'Ahmed Nur', 'Farhiya Jama'];
  const allWaiters = Array.from(new Set([
    ...orders.map(o => o.waiterName).filter(Boolean),
    ...employees.map(e => e.name),
    ...defaultWaiters
  ] as string[])).filter(Boolean);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          (o.waiterName && o.waiterName.toLowerCase().includes(search.toLowerCase()));
    const matchesChannel = filterChannel === 'all' || o.orderType === filterChannel;
    const matchesWaiter = filterWaiter === 'all' || (o.waiterName || 'Staff Waiter') === filterWaiter;
    return matchesSearch && matchesChannel && matchesWaiter;
  });

  // Calculate waiter performance summary
  const activeWaiterName = filterWaiter !== 'all' ? filterWaiter : null;
  const waiterOrders = activeWaiterName 
    ? orders.filter(o => (o.waiterName || 'Staff Waiter') === activeWaiterName)
    : [];
  
  const waiterTotalSales = waiterOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.totalAmount : 0), 0);
  const waiterCompletedOrders = waiterOrders.filter(o => o.status === 'Completed').length;
  const waiterActiveOrders = waiterOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const waiterAvgOrderValue = waiterOrders.length > 0 ? waiterTotalSales / waiterOrders.length : 0;

  const handleConfirmDelete = () => {
    if (orderToDelete && onDeleteOrder) {
      onDeleteOrder(orderToDelete.id);
      if (selectedOrderForModal?.id === orderToDelete.id) {
        setSelectedOrderForModal(null);
      }
      setOrderToDelete(null);
    }
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Order Tracking & History</h1>
            <p className="text-muted small mb-0">Centralized log of all Dine In, Takeaway, Delivery & Online Orders</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          
          {/* Quick "View My Orders" Button */}
          <button
            onClick={() => {
              if (filterWaiter !== 'Mohamed Farah') {
                setFilterWaiter('Mohamed Farah');
              } else {
                setFilterWaiter('all');
              }
            }}
            className={`btn btn-sm ${filterWaiter === 'Mohamed Farah' ? 'btn-success text-white shadow-sm' : 'btn-outline-success'} fw-bold d-flex align-items-center gap-1.5 px-3 rounded-pill`}
            title="Toggle Quick View for My Assigned Orders (Mohamed Farah)"
          >
            <UserCheck className="w-4 h-4" />
            <span>{filterWaiter === 'Mohamed Farah' ? '✓ Showing My Orders' : 'View My Orders'}</span>
          </button>

          {/* Waiter Filter Dropdown */}
          <div className="d-flex align-items-center gap-1.5 bg-light p-1 rounded-3 border">
            <User className="w-4 h-4 text-muted ms-1" />
            <select
              value={filterWaiter}
              onChange={(e) => setFilterWaiter(e.target.value)}
              className="form-select form-select-sm border-0 bg-transparent fw-semibold text-primary style-badge"
              style={{ width: '160px', fontSize: '0.82rem' }}
            >
              <option value="all">All Waiters</option>
              {allWaiters.map((w, idx) => (
                <option key={idx} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Filter Pills */}
          <div className="btn-group btn-group-sm">
            {['all', 'Dine In', 'Take Away', 'Delivery', 'Online'].map(ch => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`btn ${filterChannel === ch ? 'btn-primary shadow-sm fw-semibold' : 'btn-outline-secondary'}`}
              >
                {ch === 'all' ? 'All Channels' : ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Waiter Performance Summary Banner */}
      {filterWaiter !== 'all' && (
        <div className={`card border-0 shadow-sm p-3 mb-4 rounded-3 ${isDarkMode ? 'bg-dark border border-success' : 'bg-success-subtle text-dark border border-success-subtle'}`}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success text-white rounded-circle shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="badge bg-success text-white mb-1">WAITER SALES PERFORMANCE</span>
                <h4 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                  <span>{filterWaiter}</span>
                </h4>
                <p className="text-muted small mb-0">Track individual sales, order counts, and fulfillment metrics</p>
              </div>
            </div>

            {/* Performance KPI Metrics */}
            <div className="d-flex flex-wrap align-items-center gap-4 bg-white p-3 rounded-3 shadow-sm border">
              <div>
                <div className="text-muted small fw-semibold">TOTAL ORDERS</div>
                <div className="h5 fw-bold mb-0 font-monospace text-dark">{waiterOrders.length}</div>
              </div>
              <div className="border-start ps-3">
                <div className="text-muted small fw-semibold">TOTAL SALES</div>
                <div className="h5 fw-bold mb-0 font-monospace text-success">${waiterTotalSales.toFixed(2)}</div>
              </div>
              <div className="border-start ps-3">
                <div className="text-muted small fw-semibold">COMPLETED</div>
                <div className="h5 fw-bold mb-0 font-monospace text-primary">{waiterCompletedOrders}</div>
              </div>
              <div className="border-start ps-3">
                <div className="text-muted small fw-semibold">ACTIVE</div>
                <div className="h5 fw-bold mb-0 font-monospace text-warning">{waiterActiveOrders}</div>
              </div>
              <div className="border-start ps-3">
                <div className="text-muted small fw-semibold">AVG ORDER VALUE</div>
                <div className="h5 fw-bold mb-0 font-monospace text-info">${waiterAvgOrderValue.toFixed(2)}</div>
              </div>
              
              <button
                onClick={() => setFilterWaiter('all')}
                className="btn btn-xs btn-outline-secondary ms-2"
                title="Clear Waiter Filter"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className={`card border-0 shadow-sm rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
        <div className="card-header bg-transparent p-3 d-flex align-items-center justify-content-between">
          <div className="input-group style-badge" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-transparent"><Search className="w-4 h-4 text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search Order #, Customer, or Waiter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="small text-muted fw-semibold">
            Found {filteredOrders.length} Orders {filterWaiter !== 'all' ? `for ${filterWaiter}` : ''}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Type & Table</th>
                <th>Assigned Waiter</th>
                <th>Customer</th>
                <th>Items Count</th>
                <th>Total Paid</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Time</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    No orders found for the selected waiter or filter parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="fw-bold font-monospace text-primary">{ord.orderNumber}</td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">{ord.orderType}</span>
                      {ord.tableName && <span className="badge bg-secondary-subtle text-secondary">{ord.tableName}</span>}
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info border border-info-subtle fw-semibold d-inline-flex align-items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{ord.waiterName || 'Staff Waiter'}</span>
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold small">{ord.customerName}</div>
                      <span className="text-muted style-badge">{ord.customerPhone || 'N/A'}</span>
                    </td>
                    <td className="font-monospace">{ord.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                    <td className="fw-bold font-monospace text-success">${ord.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        ord.paymentStatus === 'Paid' ? 'bg-success' :
                        ord.paymentStatus === 'Refunded' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span className={`badge ${
                        ord.status === 'Completed' ? 'bg-success' :
                        ord.status === 'Preparing' ? 'bg-warning text-dark' :
                        ord.status === 'Ready' ? 'bg-info text-dark' : 'bg-secondary'
                      }`}>
                        {ord.status}
                      </span>
                    </td>

                    <td className="text-muted small font-monospace">
                      {new Date(ord.createdAt).toLocaleTimeString()}
                    </td>

                    <td className="text-end">
                      <div className="d-inline-flex align-items-center justify-content-end gap-1">
                        <button
                          onClick={() => triggerKotPrint(ord, settings)}
                          className="btn btn-xs btn-outline-warning text-dark p-1 rounded-2"
                          title="Send Kitchen Ticket to Back-of-House Printer (KOT)"
                          style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                        >
                          <UtensilsCrossed className="w-3.5 h-3.5 text-warning" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          className="btn btn-xs btn-outline-primary p-1 rounded-2"
                          title="Send Bill to Cashier Customer Receipt Printer"
                          style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedOrderForModal(ord)}
                          className="btn btn-xs btn-outline-secondary p-1 rounded-2"
                          title="View Details"
                          style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {ord.paymentStatus === 'Paid' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to refund Order ${ord.orderNumber}?`)) {
                                onRefundOrder(ord.id);
                              }
                            }}
                            className="btn btn-xs btn-outline-warning text-dark p-1 rounded-2"
                            title="Process Refund"
                            style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setOrderToDelete(ord)}
                          className="btn btn-xs btn-danger p-1 rounded-2 text-white"
                          title="Cancel & Delete Order (Order Return)"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Deletion Confirmation Modal */}
      {orderToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Order Cancellation & Return</span>
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOrderToDelete(null)}
                ></button>
              </div>

              <div className="modal-body p-4 text-center">
                <div className="p-3 bg-danger-subtle text-danger rounded-circle d-inline-flex mb-3 mx-auto">
                  <Trash2 className="w-8 h-8" />
                </div>

                <h5 className="fw-bold text-dark mb-2">
                  Cancel Order #{orderToDelete.orderNumber}?
                </h5>
                <p className="text-muted small mb-3">
                  This action cannot be undone. Are you sure you want to permanently cancel and remove this order from active records?
                </p>

                <div className="bg-light p-3 rounded-3 text-start small font-monospace mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Customer Name:</span>
                    <span className="fw-bold text-dark">{orderToDelete.customerName}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Order Type:</span>
                    <span className="badge bg-secondary-subtle text-dark">{orderToDelete.orderType}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 mt-2">
                    <span className="fw-bold text-dark">Order Total:</span>
                    <span className="fw-bold text-danger">${orderToDelete.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm fw-semibold px-3"
                  onClick={() => setOrderToDelete(null)}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm fw-bold px-4 d-flex align-items-center gap-1.5 shadow-sm"
                  onClick={handleConfirmDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrderForModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title h6 fw-bold">Order Details: {selectedOrderForModal.orderNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedOrderForModal(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <div className="fw-bold text-dark mb-1">Customer: {selectedOrderForModal.customerName}</div>
                  <div className="small text-muted">Assigned Waiter: <span className="fw-bold text-primary">{selectedOrderForModal.waiterName || 'Staff Waiter'}</span></div>
                  <div className="small text-muted">Type: {selectedOrderForModal.orderType} | Table: {selectedOrderForModal.tableName || 'N/A'}</div>
                  <div className="small text-muted">Created: {new Date(selectedOrderForModal.createdAt).toLocaleString()}</div>
                </div>

                <div className="list-group mb-3">
                  {selectedOrderForModal.items.map(i => (
                    <div key={i.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold small">{i.quantity}x {i.name}</div>
                        {i.kitchenNotes && <div className="text-danger style-badge">Note: {i.kitchenNotes}</div>}
                      </div>
                      <div className="fw-bold font-monospace">${i.subtotal.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-light p-3 rounded-3 font-monospace">
                  <div className="d-flex justify-content-between"><span>Subtotal:</span><span>${selectedOrderForModal.subtotal.toFixed(2)}</span></div>
                  <div className="d-flex justify-content-between"><span>Tax:</span><span>${selectedOrderForModal.taxAmount.toFixed(2)}</span></div>
                  <div className="d-flex justify-content-between fw-bold h6 border-top pt-2 mt-1 mb-0">
                    <span>Total Paid:</span><span className="text-success">${selectedOrderForModal.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <button
                  className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1"
                  onClick={() => {
                    setOrderToDelete(selectedOrderForModal);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel Order</span>
                </button>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-warning text-dark btn-sm fw-bold d-flex align-items-center gap-1.5"
                    onClick={() => triggerKotPrint(selectedOrderForModal, settings)}
                    title="Send ticket to Kitchen Printer (KOT)"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-warning" />
                    <span>Print Kitchen Ticket (KOT)</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-1.5"
                    onClick={() => {
                      setSelectedOrderForReceipt(selectedOrderForModal);
                      setSelectedOrderForModal(null);
                    }}
                    title="Send bill to Cashier Customer Receipt Printer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Customer Receipt Modal</span>
                  </button>
                  <button className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedOrderForModal(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrderForReceipt && (
        <ReceiptModal
          order={selectedOrderForReceipt}
          settings={settings}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

    </div>
  );
};
