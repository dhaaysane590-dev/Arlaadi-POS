import React, { useState } from 'react';
import {
  User,
  UserRole,
  RestaurantSettings,
  Order,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  OrderType,
  RestaurantTenant
} from '../../types';
import {
  UtensilsCrossed,
  ShieldCheck,
  ChevronDown,
  Plus,
  Moon,
  Sun,
  Menu,
  Receipt,
  Edit2,
  Trash2,
  ArrowLeft,
  Check,
  ShoppingBag,
  User as UserIcon,
  Store,
  LayoutDashboard,
  Building2,
  Sliders,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  settings: RestaurantSettings;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  onLogout?: () => void;
  tenants?: RestaurantTenant[];
  activeTenantId?: string;
  onSelectTenant?: (tenantId: string) => void;
  orders: Order[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onSelectOrderToCart?: (order: Order) => void;
  onQuickNewOrder: () => void;
  onOpenCustomerSite?: () => void;
  onNavigateToDashboard?: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  tenants = [],
  activeTenantId,
  onSelectTenant,
  orders,
  onUpdateOrder,
  onSelectOrderToCart,
  onQuickNewOrder,
  onOpenCustomerSite,
  onNavigateToDashboard,
  isDarkMode,
  onToggleDarkMode,
  onToggleMobileSidebar
}) => {
  const [showLastOrdersModal, setShowLastOrdersModal] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderSearch, setOrderSearch] = useState<string>('');

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-danger text-white';
      case 'Restaurant Owner': return 'bg-dark text-white';
      case 'Branch Manager': return 'bg-primary text-white';
      case 'Cashier': return 'bg-success text-white';
      case 'Waiter': return 'bg-info text-dark';
      case 'Kitchen Staff': return 'bg-warning text-dark';
      case 'Inventory Manager': return 'bg-secondary text-white';
      case 'Accountant': return 'bg-purple text-white';
      case 'Shift Supervisor': return 'bg-primary text-white';
      case 'Delivery Driver': return 'bg-teal text-white';
      case 'Customer': return 'bg-light text-dark border';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Preparing': return 'bg-info text-dark';
      case 'Ready': return 'bg-primary text-white';
      case 'Served': return 'bg-secondary text-white';
      case 'Completed': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return 'bg-success text-white';
      case 'Unpaid': return 'bg-danger text-white';
      case 'Partially Paid': return 'bg-warning text-dark';
      case 'Refunded': return 'bg-secondary text-white';
      default: return 'bg-secondary text-white';
    }
  };

  // Order item quantity change in Edit Mode
  const handleItemQtyChange = (itemId: string, delta: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items
      .map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            subtotal: item.unitPrice * newQty
          };
        }
        return item;
      })
      .filter(item => item.quantity > 0);

    const subtotal = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
    const taxAmount = subtotal * (settings.taxRatePercentage / 100);
    const totalAmount = Math.max(0, subtotal + taxAmount + editingOrder.serviceCharge + editingOrder.tipAmount - editingOrder.discountAmount);

    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal,
      taxAmount,
      totalAmount
    });
  };

  // Save Order Edits
  const handleSaveOrderEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const subtotal = editingOrder.items.reduce((sum, i) => sum + i.subtotal, 0);
    const taxAmount = subtotal * (settings.taxRatePercentage / 100);
    const totalAmount = Math.max(0, subtotal + taxAmount + editingOrder.serviceCharge + editingOrder.tipAmount - editingOrder.discountAmount);

    const updated: Order = {
      ...editingOrder,
      subtotal,
      taxAmount,
      totalAmount,
      updatedAt: new Date().toLocaleString()
    };

    onUpdateOrder(updated);
    setEditingOrder(null);
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.orderType.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <>
      <header
        className={`navbar sticky-top border-bottom px-3 py-2 ${
          isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white text-dark border-light-subtle'
        }`}
        style={{ zIndex: 1030, backdropFilter: 'blur(8px)' }}
      >
        <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
          
          {/* Mobile Toggle & Brand Logo */}
          <div className="d-flex align-items-center gap-2.5">
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className={`btn btn-sm p-2 rounded-2 d-md-none border ${
                  isDarkMode ? 'btn-outline-secondary text-light' : 'btn-outline-secondary text-dark'
                }`}
                aria-label="Toggle Navigation Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div
              onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
              className="rounded-3 p-2 text-white shadow-sm d-flex align-items-center justify-content-center cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #18604d 0%, #124337 100%)', cursor: 'pointer' }}
              title="Go to Dashboard"
            >
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h1
                  onClick={() => onNavigateToDashboard && onNavigateToDashboard()}
                  className="h6 mb-0 fw-bold font-display tracking-tight cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  title="Go to Dashboard"
                >
                  {settings.name}
                </h1>

                {/* Super Admin Restaurant Switcher */}
                {currentUser.role === 'Super Admin' && tenants.length > 0 && (
                  <div className="dropdown ms-1">
                    <button
                      className="btn btn-xs btn-outline-danger dropdown-toggle fw-bold rounded-pill px-2 py-0.5 d-flex align-items-center gap-1 shadow-sm"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ fontSize: '0.72rem' }}
                      title="Super Admin Multi-Restaurant Switcher"
                    >
                      <Building2 className="w-3 h-3" />
                      <span>{tenants.find(t => t.id === activeTenantId)?.code || 'Multi-Tenant'}</span>
                    </button>
                    <ul className={`dropdown-menu shadow p-2 ${isDarkMode ? 'dropdown-menu-dark' : ''}`} style={{ minWidth: '250px' }}>
                      <li className="dropdown-header small text-uppercase fw-bold text-danger pb-1">
                        Select Active Restaurant Context
                      </li>
                      {tenants.map(t => (
                        <li key={t.id}>
                          <button
                            className={`dropdown-item rounded-2 py-1.5 px-2 small d-flex align-items-center justify-content-between mb-1 ${
                              t.id === activeTenantId ? 'active bg-danger text-white fw-bold' : ''
                            }`}
                            onClick={() => onSelectTenant && onSelectTenant(t.id)}
                          >
                            <div className="text-truncate me-2" style={{ maxWidth: '170px' }}>
                              <div className="fw-semibold">{t.name}</div>
                              <div className="text-xs opacity-75">{t.code} • {t.ownerName}</div>
                            </div>
                            {t.id === activeTenantId && <Check className="w-4 h-4 flex-shrink-0" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Last Orders Header Button */}
          <div className="d-flex align-items-center gap-2.5">
            
            {/* Customer View Site Button */}
            {onOpenCustomerSite && (
              <button
                onClick={onOpenCustomerSite}
                className="btn btn-sm btn-emerald text-white rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fw-bold shadow-sm"
                style={{ backgroundColor: '#059669' }}
                title="Open Customer-Facing Menu & Ordering Portal"
              >
                <Store className="w-4 h-4 text-warning" />
                <span>Customer Site</span>
              </button>
            )}

            {/* Last Orders Button */}
            <button
              onClick={() => {
                setEditingOrder(null);
                setShowLastOrdersModal(true);
              }}
              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 fw-semibold shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>Last Orders ({orders.length})</span>
            </button>

            {/* Fast New POS Order Button */}
            <button 
              onClick={onQuickNewOrder}
              className="btn btn-sm btn-warning text-dark fw-semibold rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Fast POS Order</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="dropdown ms-1">
              <button 
                className={`btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center border ${isDarkMode ? 'btn-dark border-secondary text-white' : 'btn-light border-secondary-subtle'}`}
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                title="User Profile"
              >
                <UserIcon className="w-4 h-4 text-primary" />
              </button>

              <ul className={`dropdown-menu dropdown-menu-end shadow p-3 ${isDarkMode ? 'dropdown-menu-dark' : ''}`} style={{ minWidth: '240px' }}>
                <li className="text-center pb-3 border-bottom">
                  <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary mx-auto mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div className="fw-bold fs-6 mb-1 text-truncate">{currentUser.name}</div>
                  <span className={`badge ${getRoleBadgeColor(currentUser.role)} px-2.5 py-1 mb-1`} style={{ fontSize: '0.75rem' }}>
                    {currentUser.role}
                  </span>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
                    <i className="fa-solid fa-code-branch me-1 text-primary"></i> Branch: {currentUser.branchId || 'Main Branch'}
                  </div>
                  <div className="mt-1">
                    <span className="text-success fw-semibold small" style={{ fontSize: '0.75rem' }}>
                      <i className="fa-solid fa-circle fa-2xs me-1"></i>Active Session
                    </span>
                  </div>
                </li>
                
                <li className="pt-3">
                  <button
                    onClick={() => onLogout && onLogout()}
                    className="btn btn-outline-danger btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </header>

      {/* Last Orders & Edit Order Modal */}
      {showLastOrdersModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className={`modal-content border-0 shadow-lg rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              
              {/* Modal Header */}
              <div className="modal-header bg-dark text-white p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  {editingOrder && (
                    <button
                      type="button"
                      onClick={() => setEditingOrder(null)}
                      className="btn btn-sm btn-outline-light me-1 p-1 rounded-circle d-flex align-items-center justify-content-center"
                      title="Back to Last Orders list"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <Receipt className="w-5 h-5 text-warning" />
                  <h5 className="modal-title h6 fw-bold mb-0">
                    {editingOrder ? `Edit Order #${editingOrder.orderNumber}` : 'Last / Recent Orders History'}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowLastOrdersModal(false);
                    setEditingOrder(null);
                  }}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Mode 1: Recent Orders List */}
                {!editingOrder && (
                  <div>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        style={{ maxWidth: '320px' }}
                        placeholder="Search by Order # or Customer..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                      <span className="small text-muted font-monospace">Total Orders: {filteredOrders.length}</span>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="mb-0">No orders found matching your search.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className={`table table-hover align-middle mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                          <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                            <tr>
                              <th>Order #</th>
                              <th>Customer / Table</th>
                              <th>Type</th>
                              <th>Items</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                              <th>Payment</th>
                              <th>Date/Time</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map((ord) => (
                              <tr key={ord.id}>
                                <td className="font-monospace fw-bold text-primary">
                                  {ord.orderNumber}
                                </td>

                                <td>
                                  <div className="fw-semibold small">{ord.customerName}</div>
                                  {ord.tableName && <span className="text-muted style-badge">{ord.tableName}</span>}
                                </td>

                                <td>
                                  <span className="badge bg-light text-dark border">{ord.orderType}</span>
                                </td>

                                <td className="small">
                                  {ord.items.length} item(s)
                                </td>

                                <td className="font-monospace fw-bold">
                                  ${ord.totalAmount.toFixed(2)}
                                </td>

                                <td>
                                  <span className={`badge ${getStatusBadge(ord.status)}`}>
                                    {ord.status}
                                  </span>
                                </td>

                                <td>
                                  <span className={`badge ${getPaymentBadge(ord.paymentStatus)}`}>
                                    {ord.paymentStatus}
                                  </span>
                                </td>

                                <td className="small text-muted font-monospace">
                                  {ord.createdAt}
                                </td>

                                <td className="text-end">
                                  <div className="d-flex align-items-center justify-content-end gap-1">
                                    {/* Direct Load into Cart Button */}
                                    <button
                                      onClick={() => {
                                        if (onSelectOrderToCart) {
                                          onSelectOrderToCart(ord);
                                        }
                                        setShowLastOrdersModal(false);
                                      }}
                                      className="btn btn-sm btn-primary d-flex align-items-center gap-1 fw-bold shadow-sm"
                                      title="Load into POS Cart to add new items"
                                    >
                                      <ShoppingBag className="w-3.5 h-3.5" />
                                      <span>Load to Cart</span>
                                    </button>

                                    {/* Quick Edit Modal Button */}
                                    <button
                                      onClick={() => setEditingOrder({ ...ord })}
                                      className="btn btn-sm btn-outline-secondary p-1.5"
                                      title="Edit Order Info"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Editable Order Form */}
                {editingOrder && (
                  <form onSubmit={handleSaveOrderEdits}>
                    <div className="row g-3 mb-4">
                      
                      {/* Customer Name */}
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Customer Name</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={editingOrder.customerName}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                        />
                      </div>

                      {/* Order Type */}
                      <div className="col-6 col-md-4">
                        <label className="form-label small fw-semibold">Order Type</label>
                        <select
                          className="form-select"
                          value={editingOrder.orderType}
                          onChange={(e) => setEditingOrder({ ...editingOrder, orderType: e.target.value as OrderType })}
                        >
                          <option value="Dine In">Dine In</option>
                          <option value="Take Away">Take Away</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Online">Online</option>
                        </select>
                      </div>

                      {/* Order Status */}
                      <div className="col-6 col-md-4">
                        <label className="form-label small fw-semibold">Order Status</label>
                        <select
                          className="form-select fw-bold"
                          value={editingOrder.status}
                          onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Served">Served</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Payment Status */}
                      <div className="col-6 col-md-4">
                        <label className="form-label small fw-semibold">Payment Status</label>
                        <select
                          className="form-select fw-bold"
                          value={editingOrder.paymentStatus}
                          onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value as PaymentStatus })}
                        >
                          <option value="Unpaid">Unpaid</option>
                          <option value="Paid">Paid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </div>

                      {/* Payment Method */}
                      <div className="col-6 col-md-4">
                        <label className="form-label small fw-semibold">Payment Method</label>
                        <select
                          className="form-select"
                          value={editingOrder.paymentMethod || 'Cash'}
                          onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value as PaymentMethod })}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="EVC Plus">EVC Plus</option>
                          <option value="ZAAD">ZAAD</option>
                          <option value="Sahal">Sahal</option>
                          <option value="Premier Wallet">Premier Wallet</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      {/* Table / Details */}
                      <div className="col-12 col-md-4">
                        <label className="form-label small fw-semibold">Table / Location Note</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Table or note..."
                          value={editingOrder.tableName || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, tableName: e.target.value })}
                        />
                      </div>

                    </div>

                    {/* Order Items Table Edit */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2 small text-uppercase text-muted">Order Line Items</h6>
                      <div className="table-responsive border rounded-3">
                        <table className={`table table-sm align-middle mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
                          <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                            <tr>
                              <th>Item Name</th>
                              <th>Unit Price</th>
                              <th className="text-center" style={{ width: '120px' }}>Quantity</th>
                              <th className="text-end">Subtotal</th>
                              <th className="text-end">Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editingOrder.items.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-3 text-muted">No items in order.</td>
                              </tr>
                            ) : (
                              editingOrder.items.map((it) => (
                                <tr key={it.id}>
                                  <td>
                                    <div className="fw-semibold small">{it.name}</div>
                                    {it.selectedVariant && <span className="text-muted style-badge">({it.selectedVariant.name})</span>}
                                  </td>

                                  <td className="font-monospace small">
                                    ${it.unitPrice.toFixed(2)}
                                  </td>

                                  <td className="text-center">
                                    <div className="d-flex align-items-center justify-content-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleItemQtyChange(it.id, -1)}
                                        className="btn btn-xs btn-outline-secondary p-1 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '22px', height: '22px' }}
                                      >
                                        -
                                      </button>
                                      <span className="fw-bold font-monospace px-1">{it.quantity}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleItemQtyChange(it.id, 1)}
                                        className="btn btn-xs btn-outline-secondary p-1 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '22px', height: '22px' }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  <td className="text-end font-monospace fw-bold">
                                    ${(it.unitPrice * it.quantity).toFixed(2)}
                                  </td>

                                  <td className="text-end">
                                    <button
                                      type="button"
                                      onClick={() => handleItemQtyChange(it.id, -it.quantity)}
                                      className="btn btn-sm btn-link text-danger p-0"
                                      title="Remove item"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary & Totals */}
                    <div className="row g-3 align-items-center border-top pt-3">
                      <div className="col-12 col-md-7">
                        <label className="form-label small fw-semibold">Kitchen / Order Notes</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={editingOrder.kitchenNotes || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, kitchenNotes: e.target.value })}
                          placeholder="Special instructions..."
                        />
                      </div>

                      <div className="col-12 col-md-5">
                        <div className={`p-3 rounded-3 border ${isDarkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light'}`}>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span>Subtotal:</span>
                            <span className="font-monospace">${editingOrder.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span>Tax ({settings.taxRatePercentage}%):</span>
                            <span className="font-monospace">${editingOrder.taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between fw-bold fs-6 border-top pt-2 text-primary">
                            <span>Total Amount:</span>
                            <span className="font-monospace">${editingOrder.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectOrderToCart) {
                            onSelectOrderToCart(editingOrder);
                          }
                          setShowLastOrdersModal(false);
                          setEditingOrder(null);
                        }}
                        className="btn btn-warning btn-sm fw-bold px-3 d-flex align-items-center gap-1.5 text-dark"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Load to POS Cart & Add New Items</span>
                      </button>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingOrder(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm fw-bold px-4 d-flex align-items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Order Changes</span>
                        </button>
                      </div>
                    </div>

                  </form>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
