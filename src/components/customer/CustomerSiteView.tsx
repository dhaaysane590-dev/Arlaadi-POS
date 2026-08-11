import React, { useState } from 'react';
import {
  MenuItem,
  MenuCategory,
  RestaurantTable,
  Order,
  OrderItem,
  OrderType,
  PaymentMethod,
  Reservation,
  RestaurantSettings
} from '../../types';
import {
  Utensils,
  Search,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Plus,
  Minus,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  ChevronRight,
  Flame,
  Leaf,
  Calendar,
  Bell,
  CreditCard,
  User as UserIcon,
  Star,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  Info
} from 'lucide-react';

interface CustomerSiteViewProps {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  tables: RestaurantTable[];
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onAddReservation?: (reservation: Reservation) => void;
  settings: RestaurantSettings;
  isDarkMode: boolean;
  onSwitchToStaff?: () => void;
}

export const CustomerSiteView: React.FC<CustomerSiteViewProps> = ({
  menuItems,
  categories,
  tables,
  orders,
  onAddOrder,
  onAddReservation,
  settings,
  isDarkMode,
  onSwitchToStaff
}) => {
  // Navigation & View Modes
  const [activeTab, setActiveTab] = useState<'menu' | 'track' | 'reserve' | 'feedback'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);

  // Cart & Order State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<OrderType>('Dine In');
  const [selectedTableId, setSelectedTableId] = useState<string>(
    tables.find(t => t.status === 'Available')?.id || tables[0]?.id || ''
  );
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC Plus');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Item Modal for Customizations
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalKitchenNotes, setModalKitchenNotes] = useState<string>('');

  // Item QR Code Modal
  const [qrCodeItem, setQrCodeItem] = useState<MenuItem | null>(null);
  const [showPrintableMenu, setShowPrintableMenu] = useState<boolean>(false);

  // Track Customer Orders
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);
  const [selectedOrderToTrack, setSelectedOrderToTrack] = useState<Order | null>(null);

  // Reservation Form State
  const [resName, setResName] = useState<string>('');
  const [resPhone, setResPhone] = useState<string>('');
  const [resGuests, setResGuests] = useState<number>(2);
  const [resDate, setResDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState<string>('19:00');
  const [resNotes, setResNotes] = useState<string>('');
  const [reservationSuccess, setReservationSuccess] = useState<boolean>(false);

  // Call Waiter / Notification Toast
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Customer Feedback
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Quick Notification Handler
  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !filterVegOnly || item.allergens?.includes('Vegetarian');
    return matchesCategory && matchesSearch && matchesVeg && item.isAvailable;
  });

  // Cart Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const taxAmount = (cartSubtotal * (settings.taxRate || 0)) / 100;
  const deliveryFee = orderType === 'Delivery' ? (settings.deliveryFee || 2.0) : 0;
  const cartTotal = cartSubtotal + taxAmount + deliveryFee;

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem, quantity: number = 1, notes: string = '') => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(i => i.menuItemId === item.id && i.kitchenNotes === notes);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * item.sellingPrice
        };
        return updated;
      } else {
        const newItem: OrderItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.sellingPrice,
          quantity: quantity,
          subtotal: quantity * item.sellingPrice,
          kitchenNotes: notes
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${quantity}x "${item.name}" to your order cart`);
    setSelectedItemForModal(null);
    setModalQuantity(1);
    setModalKitchenNotes('');
  };

  // Update Cart Item Quantity
  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice
          };
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  // Submit Order from Customer Site
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (orderType === 'Delivery' && !customerPhone.trim()) {
      alert('Please provide a contact phone number for delivery.');
      return;
    }

    const selectedTableObj = tables.find(t => t.id === selectedTableId);
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-cust-${Date.now()}`,
      orderNumber: orderNum,
      orderType: orderType,
      tableId: orderType === 'Dine In' ? selectedTableId : undefined,
      tableName: orderType === 'Dine In' ? (selectedTableObj ? selectedTableObj.tableNumber : 'Table') : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: orderType === 'Delivery' ? deliveryAddress.trim() : undefined,
      items: cartItems,
      subtotal: cartSubtotal,
      taxAmount: taxAmount,
      discountAmount: 0,
      serviceCharge: 0,
      tipAmount: 0,
      totalAmount: cartTotal,
      paidAmount: paymentMethod === 'Cash' ? 0 : cartTotal,
      changeAmount: 0,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'Cash' ? 'Unpaid' : 'Paid',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kitchenNotes: orderNotes.trim() || undefined
    };

    onAddOrder(newOrder);
    setPlacedOrderIds(prev => [newOrder.id, ...prev]);
    setSelectedOrderToTrack(newOrder);
    setCartItems([]);
    setIsCartOpen(false);
    setActiveTab('track');
    showToast(`Order #${newOrder.orderNumber} placed successfully! Sent directly to the kitchen.`);
  };

  // Submit Reservation
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !resPhone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }

    if (onAddReservation) {
      const newRes: Reservation = {
        id: `res-${Date.now()}`,
        customerName: resName,
        phone: resPhone,
        guestsCount: resGuests,
        reservationDate: resDate,
        reservationTime: resTime,
        status: 'Pending',
        notes: resNotes
      };
      onAddReservation(newRes);
    }

    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setResName('');
      setResPhone('');
      setResNotes('');
    }, 4000);
  };

  // Active tracked customer orders
  const customerTrackedOrders = orders.filter(o => placedOrderIds.includes(o.id));

  return (
    <div className={`min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      
      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3 shadow-lg rounded-pill bg-dark text-white px-4 py-2.5 d-flex align-items-center gap-2 border border-warning" style={{ zIndex: 1080 }}>
          <Sparkles className="w-4 h-4 text-warning" />
          <span className="small fw-bold">{notificationToast}</span>
        </div>
      )}

      {/* TOP BRANDING BANNER & NAVIGATION BAR */}
      <header className="bg-emerald-900 text-white shadow-sm position-relative overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 px-3 py-4 p-md-5">
          <div className="container-xl">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              
              {/* Brand Info */}
              <div className="d-flex align-items-center gap-3">
                <div className="bg-white p-2 rounded-4 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                  <Utensils className="w-8 h-8 text-emerald-700" />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h1 className="h4 fw-bold mb-0 text-white">{settings.name || 'Somali Heritage Restaurant'}</h1>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 text-xs rounded-pill">
                      ● Open Now
                    </span>
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-3 text-emerald-200 small mt-1">
                    <span className="d-flex align-items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-warning" />
                      {settings.address || 'K4 Square, Mogadishu'}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-warning" />
                      {settings.phone || '+252 61 555 0199'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Header Buttons */}
              <div className="d-flex align-items-center gap-2 ms-auto">
                <button
                  onClick={() => setShowPrintableMenu(true)}
                  className="btn btn-sm btn-light text-emerald-900 fw-bold d-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
                  title="View and print full interactive digital menu"
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Print Full Menu</span>
                </button>

                {onSwitchToStaff && (
                  <button
                    onClick={onSwitchToStaff}
                    className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
                    title="Switch back to Staff POS / Management View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Staff Portal</span>
                  </button>
                )}

                {/* Call Waiter Quick Button */}
                <button
                  onClick={() => showToast('🔔 Waiter alerted! A staff member will attend to your table shortly.')}
                  className="btn btn-sm btn-warning text-dark fw-bold d-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Call Waiter</span>
                </button>

                {/* Shopping Cart Button */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="btn btn-emerald text-white fw-bold d-flex align-items-center gap-2 rounded-pill px-3.5 py-2 shadow-sm position-relative"
                  style={{ backgroundColor: '#059669' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0) > 0 && (
                    <span className="badge bg-warning text-dark rounded-pill ms-1">
                      {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Site Mode Tabs */}
            <div className="d-flex align-items-center gap-2 pt-2 border-top border-emerald-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('menu')}
                className={`btn btn-sm rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  activeTab === 'menu'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Online Menu & Ordering</span>
              </button>

              <button
                onClick={() => setActiveTab('track')}
                className={`btn btn-sm rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 fw-semibold transition-all position-relative ${
                  activeTab === 'track'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Live Order Tracking</span>
                {customerTrackedOrders.length > 0 && (
                  <span className="badge bg-warning text-dark rounded-circle px-1.5 py-0.5 text-xs">
                    {customerTrackedOrders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('reserve')}
                className={`btn btn-sm rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  activeTab === 'reserve'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Book a Table</span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={`btn btn-sm rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 fw-semibold transition-all ${
                  activeTab === 'feedback'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Reviews & Feedback</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="container-xl py-4">

        {/* TAB 1: ONLINE MENU & ORDERING */}
        {activeTab === 'menu' && (
          <div>
            
            {/* Search Bar & Filters Header */}
            <div className={`card border-0 shadow-sm p-3.5 mb-4 rounded-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-6">
                  <div className="input-group">
                    <span className={`input-group-text border-end-0 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light'}`}>
                      <Search className="w-4 h-4 text-muted" />
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ${isDarkMode ? 'bg-dark text-light border-secondary' : 'bg-light'}`}
                      placeholder="Search delicious dishes, drinks, appetizers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setSearchQuery('')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-12 col-md-6 d-flex align-items-center justify-content-md-end gap-3">
                  <div className="form-check form-switch mb-0">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="vegFilter"
                      checked={filterVegOnly}
                      onChange={(e) => setFilterVegOnly(e.target.checked)}
                    />
                    <label className="form-check-label small fw-bold d-flex align-items-center gap-1 cursor-pointer" htmlFor="vegFilter">
                      <Leaf className="w-3.5 h-3.5 text-success" />
                      <span>Vegetarian Only</span>
                    </label>
                  </div>

                  <span className="text-muted small">
                    Showing <strong>{filteredMenuItems.length}</strong> items
                  </span>
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="d-flex align-items-center gap-2 mt-3 pt-3 border-top overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`btn btn-sm rounded-pill px-3.5 py-1.5 text-nowrap fw-bold transition-all ${
                    selectedCategory === 'all'
                      ? 'btn-emerald text-white shadow-sm'
                      : isDarkMode ? 'btn-outline-secondary text-light' : 'btn-outline-secondary'
                  }`}
                  style={selectedCategory === 'all' ? { backgroundColor: '#059669' } : {}}
                >
                  All Categories ({menuItems.length})
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`btn btn-sm rounded-pill px-3.5 py-1.5 text-nowrap fw-bold transition-all ${
                      selectedCategory === cat.id
                        ? 'btn-emerald text-white shadow-sm'
                        : isDarkMode ? 'btn-outline-secondary text-light' : 'btn-outline-secondary'
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: '#059669' } : {}}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-5">
                <Utensils className="w-12 h-12 text-muted mb-3 mx-auto" />
                <h5 className="fw-bold">No dishes found</h5>
                <p className="text-muted small">Try searching for something else or clear filters.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setFilterVegOnly(false); }}
                  className="btn btn-sm btn-outline-emerald mt-2"
                >
                  Reset Menu Filters
                </button>
              </div>
            ) : (
              <div className="row g-3.5">
                {filteredMenuItems.map(item => (
                  <div key={item.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover:shadow-md ${
                      isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'
                    }`}>
                      
                      {/* Image & Badges */}
                      <div className="position-relative bg-light" style={{ height: '170px' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                          alt={item.name}
                          className="w-100 h-100 object-fit-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
                          }}
                        />

                        {/* Prep time badge */}
                        <div className="position-absolute bottom-2 start-2 bg-dark text-white bg-opacity-75 px-2 py-1 rounded-pill text-xs d-flex align-items-center gap-1 backdrop-blur">
                          <Clock className="w-3 h-3 text-warning" />
                          <span>{item.prepTimeMinutes || 15} mins</span>
                        </div>

                        {/* Vegetarian Badge */}
                        {item.allergens?.includes('Vegetarian') && (
                          <div className="position-absolute top-2 start-2 bg-success text-white px-2 py-0.5 rounded-pill text-xs fw-bold d-flex align-items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            <span>Veg</span>
                          </div>
                        )}

                        {/* Price Badge */}
                        <div className="position-absolute top-2 end-2 bg-emerald-700 text-white fw-extrabold px-2.5 py-1 rounded-pill text-sm shadow-sm" style={{ backgroundColor: '#047857' }}>
                          ${item.sellingPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex align-items-start justify-content-between gap-1 mb-1">
                            <h6 className="fw-bold mb-0 text-truncate" title={item.name}>{item.name}</h6>
                          </div>
                          <p className="text-muted small line-clamp-2 mb-3" style={{ fontSize: '0.8rem', minHeight: '2.4rem' }}>
                            {item.description || 'Deliciously prepared using fresh local ingredients.'}
                          </p>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                          <span className="text-emerald-700 fw-bold" style={{ color: '#047857' }}>
                            ${item.sellingPrice.toFixed(2)}
                          </span>

                          <div className="d-flex align-items-center gap-1.5">
                            <button
                              onClick={() => setQrCodeItem(item)}
                              className="btn btn-sm btn-outline-secondary rounded-circle p-1.5 d-flex align-items-center justify-content-center"
                              title="Display QR code for item details"
                              style={{ width: '32px', height: '32px' }}
                            >
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedItemForModal(item);
                                setModalQuantity(1);
                                setModalKitchenNotes('');
                              }}
                              className="btn btn-sm btn-emerald text-white rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                              style={{ backgroundColor: '#059669' }}
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: LIVE ORDER TRACKING */}
        {activeTab === 'track' && (
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-lg-8">
              <div className={`card border-0 shadow-sm p-4 rounded-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
                
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>Real-Time Order Status Tracker</span>
                </h5>

                {customerTrackedOrders.length === 0 ? (
                  <div className="text-center py-5">
                    <ShoppingBag className="w-12 h-12 text-muted mb-3 mx-auto" />
                    <h6 className="fw-bold">No active orders placed yet</h6>
                    <p className="text-muted small mb-3">Place an order from the Online Menu tab to track kitchen status live!</p>
                    <button onClick={() => setActiveTab('menu')} className="btn btn-sm btn-emerald text-white rounded-pill px-4" style={{ backgroundColor: '#059669' }}>
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Order Selector Tabs */}
                    <div className="d-flex gap-2 overflow-x-auto mb-4 pb-2 border-bottom">
                      {customerTrackedOrders.map(ord => (
                        <button
                          key={ord.id}
                          onClick={() => setSelectedOrderToTrack(ord)}
                          className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold text-nowrap ${
                            (selectedOrderToTrack?.id || customerTrackedOrders[0]?.id) === ord.id
                              ? 'btn-emerald text-white'
                              : 'btn-outline-secondary'
                          }`}
                          style={(selectedOrderToTrack?.id || customerTrackedOrders[0]?.id) === ord.id ? { backgroundColor: '#059669' } : {}}
                        >
                          Order #{ord.orderNumber} ({ord.status})
                        </button>
                      ))}
                    </div>

                    {/* Active Order Progress View */}
                    {(() => {
                      const activeOrd = orders.find(o => o.id === (selectedOrderToTrack?.id || customerTrackedOrders[0]?.id)) || customerTrackedOrders[0];
                      if (!activeOrd) return null;

                      const statusSteps: { key: string; label: string; desc: string }[] = [
                        { key: 'Pending', label: 'Order Submitted', desc: 'Received by kitchen counter' },
                        { key: 'Preparing', label: 'Kitchen Preparing', desc: 'Chefs are crafting your dish' },
                        { key: 'Ready', label: 'Order Ready', desc: 'Fresh & hot for pickup or table' },
                        { key: 'Served', label: 'Served / Completed', desc: 'Delivered to your table / location' }
                      ];

                      const getStepIndex = (status: string) => {
                        switch (status) {
                          case 'Pending': return 0;
                          case 'Preparing': return 1;
                          case 'Ready': return 2;
                          case 'Served':
                          case 'Completed': return 3;
                          default: return 0;
                        }
                      };

                      const currentStep = getStepIndex(activeOrd.status);

                      return (
                        <div className="bg-light p-4 rounded-4 border">
                          
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
                            <div>
                              <span className="text-muted small">Tracking Order:</span>
                              <h4 className="fw-bold text-emerald-800 mb-0">#{activeOrd.orderNumber}</h4>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-pill fw-bold" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                                Status: {activeOrd.status}
                              </span>
                              <div className="text-muted text-xs mt-1">Placed: {new Date(activeOrd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>

                          {/* Progress Tracker Bar */}
                          <div className="row g-2 mb-4 text-center">
                            {statusSteps.map((step, idx) => {
                              const isPassed = idx <= currentStep;
                              const isCurrent = idx === currentStep;

                              return (
                                <div key={step.key} className="col-3">
                                  <div className={`p-2 rounded-3 text-xs fw-bold transition-all ${
                                    isCurrent ? 'bg-warning text-dark shadow-sm ring-2' :
                                    isPassed ? 'bg-success text-white' : 'bg-secondary-subtle text-muted'
                                  }`}>
                                    <div className="mb-1">
                                      {isPassed ? <CheckCircle2 className="w-4 h-4 mx-auto" /> : <Clock className="w-4 h-4 mx-auto text-muted" />}
                                    </div>
                                    <div className="d-none d-sm-block">{step.label}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Details List */}
                          <div className="bg-white p-3 rounded-3 border mb-3">
                            <h6 className="fw-bold mb-2 border-bottom pb-2">Order Summary ({activeOrd.items.length} Items)</h6>
                            <div className="vstack gap-2">
                              {activeOrd.items.map((item, idx) => (
                                <div key={idx} className="d-flex align-items-center justify-content-between small">
                                  <div>
                                    <span className="fw-bold">{item.quantity}x</span> {item.name}
                                    {item.kitchenNotes && <span className="text-muted ms-2 italic">({item.kitchenNotes})</span>}
                                  </div>
                                  <span className="fw-semibold">${item.subtotal.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-top pt-2 mt-3 d-flex align-items-center justify-content-between fw-bold">
                              <span>Total Amount:</span>
                              <span className="text-emerald-700 h5 mb-0">${activeOrd.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between text-muted text-xs">
                            <span>Type: <strong>{activeOrd.orderType}</strong> {activeOrd.tableName ? `(${activeOrd.tableName})` : ''}</span>
                            <span>Payment: <strong>{activeOrd.paymentMethod}</strong> ({activeOrd.paymentStatus})</span>
                          </div>

                        </div>
                      );
                    })()}

                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TABLE RESERVATION */}
        {activeTab === 'reserve' && (
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className={`card border-0 shadow-sm p-4 rounded-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
                
                <div className="text-center mb-4">
                  <div className="bg-emerald-100 text-emerald-800 p-3 rounded-circle d-inline-flex mb-2" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h4 className="fw-bold mb-1">Book a Table Online</h4>
                  <p className="text-muted small mb-0">Reserve a table at Somali Heritage Restaurant for dining with friends & family.</p>
                </div>

                {reservationSuccess ? (
                  <div className="alert alert-success p-4 rounded-4 text-center">
                    <CheckCircle2 className="w-10 h-10 text-success mb-2 mx-auto" />
                    <h5 className="fw-bold">Reservation Request Submitted!</h5>
                    <p className="small text-muted mb-0">We have received your table booking request. Our team will confirm shortly via SMS/Call.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReservationSubmit} className="vstack gap-3">
                    <div>
                      <label className="form-label fw-bold small">Your Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Abdi Hassan"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label fw-bold small">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+252 61 XXX XXXX"
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        required
                      />
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label fw-bold small">Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={resDate}
                          onChange={(e) => setResDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold small">Time</label>
                        <input
                          type="time"
                          className="form-control"
                          value={resTime}
                          onChange={(e) => setResTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label fw-bold small">Number of Guests</label>
                      <select
                        className="form-select"
                        value={resGuests}
                        onChange={(e) => setResGuests(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label fw-bold small">Special Requests / Occasion</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="e.g. Birthday celebration, Quiet VIP corner table..."
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-emerald text-white fw-bold py-2.5 rounded-pill shadow-sm mt-2"
                      style={{ backgroundColor: '#059669' }}
                    >
                      Confirm Table Booking
                    </button>
                  </form>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REVIEWS & FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-8">
              <div className={`card border-0 shadow-sm p-4 rounded-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
                
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <span>Customer Reviews & Dining Feedback</span>
                </h5>

                {feedbackSubmitted ? (
                  <div className="alert alert-success p-3 rounded-3 text-center">
                    <CheckCircle2 className="w-8 h-8 text-success mb-1 mx-auto" />
                    <h6 className="fw-bold mb-0">Thank you for your feedback!</h6>
                  </div>
                ) : (
                  <div className="bg-light p-3 rounded-3 border mb-4">
                    <h6 className="fw-bold mb-2 small">Rate Your Recent Dining Experience:</h6>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          className="btn btn-link p-0 border-0"
                          type="button"
                        >
                          <Star className={`w-6 h-6 ${star <= feedbackRating ? 'text-warning fill-warning' : 'text-muted'}`} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="form-control form-control-sm mb-2"
                      rows={2}
                      placeholder="Share your thoughts about food taste, service speed, or atmosphere..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackSubmitted(true);
                        showToast('Thank you! Your feedback has been sent to restaurant management.');
                      }}
                      className="btn btn-sm btn-emerald text-white fw-bold rounded-pill px-3"
                      style={{ backgroundColor: '#059669' }}
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}

                {/* Sample Customer Testimonials */}
                <h6 className="fw-bold mb-3">Recent Customer Reviews:</h6>
                <div className="vstack gap-2.5">
                  {[
                    { name: 'Mohamed Jama', rating: 5, date: 'Yesterday', text: 'Best camel steak and fresh mango juice in town! Staff was super polite.' },
                    { name: 'Fatima Ali', rating: 5, date: '2 days ago', text: 'Loved the fast QR table ordering! KOT kitchen ticket system works smoothly.' },
                    { name: 'Hassan Noor', rating: 4, date: '3 days ago', text: 'Delicious food and clean environment. Highly recommended!' }
                  ].map((rev, idx) => (
                    <div key={idx} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-bold small">{rev.name}</span>
                        <div className="d-flex align-items-center gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted small mb-0">{rev.text}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ITEM CUSTOMIZATION MODAL */}
      {selectedItemForModal && (
        <div className="modal fade show d-block bg-dark bg-opacity-75 z-3" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content border-0 shadow-lg rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-white' : 'bg-white'}`}>
              
              <div className="position-relative" style={{ height: '200px' }}>
                <img
                  src={selectedItemForModal.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'}
                  alt={selectedItemForModal.name}
                  className="w-100 h-100 object-fit-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(null)}
                  className="btn-close btn-close-white position-absolute top-3 end-3 bg-dark bg-opacity-50 p-2 rounded-circle"
                />
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <h5 className="fw-bold mb-0">{selectedItemForModal.name}</h5>
                  <span className="h5 fw-extrabold text-emerald-700 mb-0" style={{ color: '#047857' }}>
                    ${(selectedItemForModal.sellingPrice * modalQuantity).toFixed(2)}
                  </span>
                </div>

                <p className="text-muted small mb-3">{selectedItemForModal.description}</p>

                {/* Quantity Controls */}
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3 border mb-3">
                  <span className="fw-bold small">Quantity:</span>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="btn btn-outline-secondary btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="fw-extrabold h5 mb-0 px-2">{modalQuantity}</span>
                    <button
                      onClick={() => setModalQuantity(modalQuantity + 1)}
                      className="btn btn-outline-secondary btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Kitchen Special Requests */}
                <div className="mb-3">
                  <label className="form-label fw-bold small">Special Instructions for Kitchen (Optional):</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Less spicy, extra sauce, no onions..."
                    value={modalKitchenNotes}
                    onChange={(e) => setModalKitchenNotes(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => handleAddToCart(selectedItemForModal, modalQuantity, modalKitchenNotes)}
                  className="btn btn-emerald text-white fw-bold w-100 py-2.5 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: '#059669' }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart — ${(selectedItemForModal.sellingPrice * modalQuantity).toFixed(2)}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER / SLIDE-OVER */}
      {isCartOpen && (
        <div className="modal fade show d-block bg-dark bg-opacity-75 z-3" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-end modal-lg h-100 my-0">
            <div className={`modal-content border-0 h-100 rounded-0 ${isDarkMode ? 'bg-dark text-white' : 'bg-white'}`}>
              
              <div className="modal-header bg-emerald-900 text-white p-3.5 border-0">
                <div className="d-flex align-items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-warning" />
                  <h5 className="modal-title fw-bold text-white mb-0">Your Order Cart</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsCartOpen(false)}
                />
              </div>

              <div className="modal-body p-4 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-5">
                    <ShoppingBag className="w-12 h-12 text-muted mb-3 mx-auto" />
                    <h6 className="fw-bold">Your cart is empty</h6>
                    <p className="text-muted small">Add delicious items from the menu to get started!</p>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="vstack gap-4">
                    
                    {/* Cart Items List */}
                    <div>
                      <h6 className="fw-bold border-bottom pb-2 mb-3">Selected Items ({cartItems.length})</h6>
                      <div className="vstack gap-2">
                        {cartItems.map((item) => (
                          <div key={item.id} className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between gap-2">
                            <div>
                              <div className="fw-bold small">{item.name}</div>
                              <div className="text-muted text-xs">${item.unitPrice.toFixed(2)} each</div>
                              {item.kitchenNotes && (
                                <div className="text-warning text-xs font-monospace mt-0.5">Note: {item.kitchenNotes}</div>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center gap-1 border bg-white rounded-pill p-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, -1)}
                                  className="btn btn-xs btn-link text-dark p-0 px-1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="fw-bold small px-1">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQty(item.id, 1)}
                                  className="btn btn-xs btn-link text-dark p-0 px-1"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="fw-bold text-emerald-800 small text-nowrap ms-2" style={{ color: '#065f46' }}>
                                ${item.subtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Type & Details */}
                    <div>
                      <h6 className="fw-bold border-bottom pb-2 mb-3">Order Type & Delivery Details</h6>
                      
                      {/* Order Type Selection */}
                      <div className="btn-group w-100 mb-3" role="group">
                        {(['Dine In', 'Take Away', 'Delivery'] as OrderType[]).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setOrderType(type)}
                            className={`btn btn-sm fw-bold py-2 ${
                              orderType === type ? 'btn-emerald text-white' : 'btn-outline-secondary'
                            }`}
                            style={orderType === type ? { backgroundColor: '#059669' } : {}}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <label className="form-label fw-bold small">Customer Name *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Your Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label className="form-label fw-bold small">Phone Number {orderType === 'Delivery' ? '*' : '(Optional)'}</label>
                          <input
                            type="tel"
                            className="form-control form-control-sm"
                            placeholder="+252 61 XXX XXXX"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required={orderType === 'Delivery'}
                          />
                        </div>

                        {orderType === 'Dine In' && (
                          <div className="col-12">
                            <label className="form-label fw-bold small">Select Table Number</label>
                            <select
                              className="form-select form-select-sm"
                              value={selectedTableId}
                              onChange={(e) => setSelectedTableId(e.target.value)}
                            >
                              {tables.map(tbl => (
                                <option key={tbl.id} value={tbl.id}>
                                  {tbl.tableNumber} - {tbl.area} ({tbl.capacity} Seats) [{tbl.status}]
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {orderType === 'Delivery' && (
                          <div className="col-12">
                            <label className="form-label fw-bold small">Delivery Address & Landmark *</label>
                            <textarea
                              className="form-control form-control-sm"
                              rows={2}
                              placeholder="House #, Street name, District, Landmark..."
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              required
                            />
                          </div>
                        )}

                        <div className="col-12">
                          <label className="form-label fw-bold small">Payment Method</label>
                          <select
                            className="form-select form-select-sm"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          >
                            <option value="EVC Plus">Somali EVC Plus (Mobile Money)</option>
                            <option value="ZAAD">ZAAD Service (Mobile Money)</option>
                            <option value="Sahal">Sahal Mobile Payment</option>
                            <option value="Cash">Cash on Delivery / Counter</option>
                            <option value="Card">Credit / Debit Card</option>
                          </select>
                        </div>
                      </div>

                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-light p-3 rounded-3 border">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Items Subtotal:</span>
                        <span>${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Tax ({settings.taxRate}%):</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      {orderType === 'Delivery' && (
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Delivery Fee:</span>
                          <span>${deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between h5 fw-extrabold border-top pt-2 mt-2 mb-0 text-emerald-800">
                        <span>Total Due:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-emerald text-white fw-bold py-3 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                      style={{ backgroundColor: '#059669' }}
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Order to Kitchen (${cartTotal.toFixed(2)})</span>
                    </button>

                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MENU ITEM QR CODE MODAL */}
      {qrCodeItem && (
        <div className="modal fade show d-block bg-dark bg-opacity-75 z-3" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content border-0 shadow-lg rounded-4 text-center p-4 ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
              
              <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
                <h5 className="fw-bold mb-0 text-emerald-800 d-flex align-items-center gap-2">
                  <Sparkles className="w-5 h-5 text-warning" />
                  <span>Item QR Code & Details</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setQrCodeItem(null)}
                />
              </div>

              <div className="py-2">
                <h6 className="fw-extrabold h5 mb-1">{qrCodeItem.name}</h6>
                <div className="text-emerald-700 fw-bold h6 mb-3" style={{ color: '#047857' }}>
                  ${qrCodeItem.sellingPrice.toFixed(2)}
                </div>

                <div className="p-3 bg-light rounded-4 d-inline-block border mb-3 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `${window.location.origin}/?item=${qrCodeItem.id}`
                    )}`}
                    alt={`QR Code for ${qrCodeItem.name}`}
                    className="rounded-3"
                    style={{ width: '180px', height: '180px' }}
                  />
                </div>

                <p className="text-muted small mb-3 max-w-sm mx-auto">
                  Scan this QR code with any mobile camera to open this dish's direct ordering page and nutritional details.
                </p>

                <div className="d-flex align-items-center justify-content-center gap-2">
                  <button
                    onClick={() => {
                      const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                        `${window.location.origin}/?item=${qrCodeItem.id}`
                      )}`;
                      window.open(url, '_blank');
                    }}
                    className="btn btn-sm btn-outline-emerald rounded-pill px-3 fw-bold"
                  >
                    Download High-Res QR
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart(qrCodeItem, 1, '');
                      setQrCodeItem(null);
                    }}
                    className="btn btn-sm btn-emerald text-white rounded-pill px-4 fw-bold"
                    style={{ backgroundColor: '#059669' }}
                  >
                    Order Dish Now
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE PRINT-FRIENDLY FULL DIGITAL MENU */}
      {showPrintableMenu && (
        <div className="modal fade show d-block bg-dark bg-opacity-75 z-3" tabIndex={-1}>
          <div className="modal-dialog modal-fullscreen p-2 p-md-4">
            <div className={`modal-content border-0 shadow-2xl rounded-4 overflow-hidden ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
              
              {/* Header Bar */}
              <div className="modal-header bg-emerald-900 text-white p-3.5 border-0 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <Utensils className="w-5 h-5 text-warning" />
                  <h5 className="modal-title fw-bold text-white mb-0">Interactive Digital Menu — Print-Friendly</h5>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-sm"
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Print Menu Now</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowPrintableMenu(false)}
                  />
                </div>
              </div>

              {/* Printable Content Body */}
              <div className="modal-body p-4 p-md-5 overflow-y-auto">
                
                {/* Restaurant Menu Header */}
                <div className="text-center pb-4 mb-4 border-bottom">
                  <h2 className="display-6 fw-extrabold text-emerald-900 mb-1" style={{ color: '#064e3b' }}>
                    {settings.name || 'Somali Heritage Restaurant'}
                  </h2>
                  <p className="text-muted fw-semibold mb-2">Authentic Culinary Menu & Digital Dining Experience</p>
                  <div className="d-flex flex-wrap justify-content-center gap-4 text-secondary small">
                    <span>📍 {settings.address || 'K4 Square, Mogadishu'}</span>
                    <span>📞 {settings.phone || '+252 61 555 0199'}</span>
                    <span>⏰ Hours: 07:00 AM – 11:00 PM</span>
                  </div>
                </div>

                {/* Categories & Menu Items */}
                <div className="vstack gap-5">
                  {categories.map(cat => {
                    const catItems = menuItems.filter(i => i.categoryId === cat.id && i.isAvailable);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat.id} className="page-break-inside-avoid">
                        <div className="d-flex align-items-center gap-3 mb-3 border-bottom border-2 border-emerald-700 pb-2">
                          <h4 className="fw-bold text-emerald-900 mb-0" style={{ color: '#065f46' }}>
                            {cat.name}
                          </h4>
                          <span className="badge bg-emerald-100 text-emerald-800 rounded-pill text-xs px-2.5 py-1" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                            {catItems.length} items
                          </span>
                        </div>

                        <div className="row g-3">
                          {catItems.map(item => (
                            <div key={item.id} className="col-12 col-md-6">
                              <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-start gap-3 h-100">
                                <div>
                                  <div className="fw-bold text-dark fs-6 mb-1">{item.name}</div>
                                  <p className="text-muted small mb-2">{item.description || 'Prepared fresh daily.'}</p>
                                  {item.allergens && item.allergens.length > 0 && (
                                    <div className="text-xs text-secondary font-monospace">
                                      Dietary: {item.allergens.join(', ')}
                                    </div>
                                  )}
                                </div>

                                <div className="text-end flex-shrink-0">
                                  <div className="fw-extrabold text-emerald-800 h5 mb-1" style={{ color: '#047857' }}>
                                    ${item.sellingPrice.toFixed(2)}
                                  </div>
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                                      `${window.location.origin}/?item=${item.id}`
                                    )}`}
                                    alt="QR Code"
                                    className="rounded border bg-white p-1"
                                    style={{ width: '50px', height: '50px' }}
                                    title="Scan QR to order"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center border-top pt-4 mt-5 text-muted small">
                  <p className="mb-0">Thank you for dining with us at {settings.name || 'Somali Heritage Restaurant'}!</p>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
