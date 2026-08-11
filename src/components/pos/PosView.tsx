import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  MenuCategory,
  RestaurantTable,
  Order,
  OrderItem,
  MenuItemVariant,
  MenuItemAddon,
  Customer,
  Employee,
  RestaurantSettings,
  PaymentMethod
} from '../../types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  PauseCircle,
  Split,
  Utensils,
  ShoppingBag,
  Check,
  Info,
  RotateCcw,
  LayoutDashboard
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { HoldOrdersModal } from './HoldOrdersModal';
import { SplitBillModal } from './SplitBillModal';

interface PosViewProps {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: RestaurantTable[];
  customers: Customer[];
  employees?: Employee[];
  settings: RestaurantSettings;
  heldOrders: Order[];
  onHoldOrder: (cartOrder: Partial<Order>) => void;
  onResumeHeldOrder: (order: Order) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  onCompleteOrder: (order: Order) => void;
  loadedOrder?: Order | null;
  onClearLoadedOrder?: () => void;
  isDarkMode: boolean;
  posDayState?: {
    isOpen: boolean;
    date: string;
    openingCash: number;
    startedAt: string;
    startedBy: string;
  };
  totalSalesToday?: number;
  todayOrdersCount?: number;
  onNavigateToPosDays?: () => void;
  onNavigateToDashboard?: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  categories,
  menuItems,
  tables,
  customers,
  employees = [],
  settings,
  heldOrders,
  onHoldOrder,
  onResumeHeldOrder,
  onDeleteHeldOrder,
  onCompleteOrder,
  loadedOrder,
  onClearLoadedOrder,
  isDarkMode,
  posDayState,
  totalSalesToday = 0,
  todayOrdersCount = 0,
  onNavigateToPosDays,
  onNavigateToDashboard
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Delivery'>('Dine In');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedWaiter, setSelectedWaiter] = useState<string>('Mohamed Farah');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);

  // Available waiter options
  const defaultWaiters = ['Mohamed Farah', 'Hassan Ali', 'Asha Omar', 'Ahmed Nur', 'Farhiya Jama'];
  const waiterList = employees && employees.length > 0 
    ? Array.from(new Set([...employees.map(e => e.name), ...defaultWaiters]))
    : defaultWaiters;

  // Tracking loaded order edit state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingOrderNumber, setEditingOrderNumber] = useState<string | null>(null);

  // Load order into cart when selected from Last Orders
  useEffect(() => {
    if (loadedOrder) {
      setCartItems([...loadedOrder.items]);
      setOrderType((loadedOrder.orderType as any) || 'Dine In');
      setSelectedTableId(loadedOrder.tableId || '');
      if (loadedOrder.waiterName) {
        setSelectedWaiter(loadedOrder.waiterName);
      }
      if (loadedOrder.discountAmount) {
        setAppliedDiscount(loadedOrder.discountAmount);
      }
      if (loadedOrder.tipAmount) {
        setTipAmount(loadedOrder.tipAmount);
      }
      setEditingOrderId(loadedOrder.id);
      setEditingOrderNumber(loadedOrder.orderNumber);
    }
  }, [loadedOrder]);

  // Modals State
  const [activeItemForCustomization, setActiveItemForCustomization] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [itemKitchenNote, setItemKitchenNote] = useState<string>('');

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<Order | null>(null);
  const [showHoldModal, setShowHoldModal] = useState<boolean>(false);
  const [showSplitModal, setShowSplitModal] = useState<boolean>(false);

  // Filter Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.barcode && item.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Direct Add To Cart without popup
  const handleDirectAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCartItems(prev => {
      const existingIndex = prev.findIndex(ci => ci.menuItemId === item.id && !ci.selectedVariant && (!ci.selectedAddons || ci.selectedAddons.length === 0));
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: existing.unitPrice * newQty
        };
        return updated;
      } else {
        const defaultVariant = item.variants?.[0];
        const unitPrice = item.sellingPrice + (defaultVariant ? defaultVariant.priceDelta : 0);
        const newItem: OrderItem = {
          id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          menuItemId: item.id,
          name: item.name,
          unitPrice,
          quantity: 1,
          selectedVariant: defaultVariant,
          selectedAddons: [],
          subtotal: unitPrice
        };
        return [...prev, newItem];
      }
    });
  };

  // Confirm Add To Cart from Modal (if customization opened)
  const handleConfirmAddToCart = () => {
    if (!activeItemForCustomization) return;
    const basePrice = activeItemForCustomization.sellingPrice;
    const variantPrice = selectedVariant ? selectedVariant.priceDelta : 0;
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + variantPrice + addonsPrice;

    const newItem: OrderItem = {
      id: 'cart-item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      menuItemId: activeItemForCustomization.id,
      name: activeItemForCustomization.name,
      unitPrice,
      quantity: 1,
      selectedVariant,
      selectedAddons: [...selectedAddons],
      kitchenNotes: itemKitchenNote,
      subtotal: unitPrice
    };

    setCartItems(prev => [...prev, newItem]);
    setActiveItemForCustomization(null);
  };

  // Cart Operations
  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          subtotal: item.unitPrice * newQty
        };
      }
      return item;
    }));
  };

  const removeCartItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== cartItemId));
  };

  // Financial Calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const taxAmount = (subtotal * settings.taxRate) / 100;
  const serviceCharge = (subtotal * settings.serviceChargeRate) / 100;
  const totalBeforeDiscount = subtotal + taxAmount + serviceCharge + tipAmount;
  const totalAmount = Math.max(0, totalBeforeDiscount - appliedDiscount);

  // Apply Coupon Code
  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10' || couponCode.toUpperCase() === 'VIP10') {
      const disc = subtotal * 0.10;
      setAppliedDiscount(disc);
    } else if (couponCode.toUpperCase() === 'VIP20') {
      const disc = subtotal * 0.20;
      setAppliedDiscount(disc);
    } else {
      alert('Invalid Promo Code! Use WELCOME10 or VIP20');
    }
  };

  // Hold Order
  const handleHoldCurrentCart = () => {
    if (cartItems.length === 0) return;

    const held: Partial<Order> = {
      orderNumber: '#HOLD-' + Math.floor(1000 + Math.random() * 9000),
      orderType,
      tableId: selectedTableId,
      tableName: tables.find(t => t.id === selectedTableId)?.tableNumber,
      customerName: loadedOrder?.customerName || 'Walk-in Guest',
      items: [...cartItems],
      subtotal,
      taxAmount,
      discountAmount: appliedDiscount,
      serviceCharge,
      tipAmount,
      totalAmount,
      status: 'Pending',
      isHeld: true,
      createdAt: new Date().toISOString(),
      waiterName: selectedWaiter || 'Staff Waiter'
    };

    onHoldOrder(held);
    handleClearAllPos();
    alert('Order held in queue!');
  };

  // Clear All POS State
  const handleClearAllPos = () => {
    setCartItems([]);
    setAppliedDiscount(0);
    setCouponCode('');
    setTipAmount(0);
    setSelectedTableId('');
    setSelectedWaiter('Mohamed Farah');
    setEditingOrderId(null);
    setEditingOrderNumber(null);
    if (onClearLoadedOrder) {
      onClearLoadedOrder();
    }
  };

  // Payment Confirmation
  const handleConfirmPayment = (method: PaymentMethod, paidAmount: number, changeAmount: number, phone?: string) => {
    const selectedTbl = tables.find(t => t.id === selectedTableId);

    const newOrder: Order = {
      id: editingOrderId || ('ord-' + Date.now()),
      orderNumber: editingOrderNumber || ('#ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)),
      orderType,
      tableId: selectedTableId,
      tableName: selectedTbl?.tableNumber,
      customerName: loadedOrder?.customerName || 'Walk-in Guest',
      customerPhone: phone || loadedOrder?.customerPhone,
      items: [...cartItems],
      subtotal,
      taxAmount,
      discountAmount: appliedDiscount,
      couponCode: appliedDiscount > 0 ? couponCode : undefined,
      serviceCharge,
      tipAmount,
      totalAmount,
      paidAmount,
      changeAmount,
      paymentMethod: method,
      paymentStatus: 'Paid',
      status: 'Preparing', // Directly sent to KDS!
      createdAt: loadedOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      waiterName: selectedWaiter || 'Staff Waiter'
    };

    onCompleteOrder(newOrder);
    setShowPaymentModal(false);
    setCompletedOrderForReceipt(newOrder);
    setCartItems([]);
    setEditingOrderId(null);
    setEditingOrderNumber(null);
    if (onClearLoadedOrder) onClearLoadedOrder();
  };

  return (
    <div className="container-fluid p-3 position-relative min-vh-100">
      
      {/* POS DAY CLOSED OVERLAY */}
      {posDayState && !posDayState.isOpen && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center p-4"
          style={{ zIndex: 1050, backdropFilter: 'blur(6px)', minHeight: '80vh' }}
        >
          <div className="card border-0 shadow-lg p-4 rounded-4 text-center bg-white" style={{ maxWidth: '440px' }}>
            <div className="p-3 bg-warning-subtle text-warning rounded-circle d-inline-flex mb-3 mx-auto" style={{ width: '64px', height: '64px', justifyContent: 'center', alignItems: 'center' }}>
              <Info className="w-8 h-8 text-warning" />
            </div>
            <h3 className="h5 fw-bold text-dark mb-2">POS Register Day is Closed</h3>
            <p className="text-muted small mb-4">
              You must start a POS Day by selecting a business date in <strong>Day Operations &gt; POS Days</strong> before taking orders.
            </p>
            <button
              onClick={onNavigateToPosDays}
              className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 shadow-sm"
            >
              Go to POS Days to Start Day
            </button>
          </div>
        </div>
      )}

      {/* POS RECEPTION SUMMARY & SHIFT STATUS BAR */}
      <div className={`d-flex flex-wrap align-items-center justify-content-between gap-2 p-2.5 px-3 rounded-3 shadow-sm mb-3 border ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
        <div className="d-flex align-items-center flex-wrap gap-3">
          {posDayState && (
            <span className={`badge px-2.5 py-1.5 fw-bold font-monospace border ${posDayState.isOpen ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'}`}>
              • POS DAY {posDayState.isOpen ? `OPEN (${posDayState.date})` : 'CLOSED'}
            </span>
          )}
          {posDayState && posDayState.isOpen && (
            <span className="text-muted small">
              Opening Float: <strong className="text-dark">${posDayState.openingCash.toFixed(2)}</strong>
            </span>
          )}
          <span className="text-muted small">
            TODAY'S SALES: <strong className="text-primary font-monospace">${totalSalesToday.toFixed(2)}</strong>
          </span>
          <span className="border-start ps-3 text-muted small">
            TODAY'S ORDERS: <strong className="text-dark font-monospace">{todayOrdersCount} {todayOrdersCount === 1 ? 'Order' : 'Orders'}</strong>
          </span>
          {posDayState && posDayState.isOpen && (
            <span className="border-start ps-3 text-muted small">
              Expected Register Cash: <strong className="text-success font-monospace">${(posDayState.openingCash + totalSalesToday).toFixed(2)}</strong>
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto ms-md-0">
          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="btn btn-sm btn-emerald text-white fw-bold d-flex align-items-center gap-1.5 rounded-pill px-3 shadow-sm"
              style={{ backgroundColor: '#059669' }}
              title="Return to Main Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-warning" />
              <span>Dashboard</span>
            </button>
          )}

          {onNavigateToPosDays && (
            <button
              onClick={onNavigateToPosDays}
              className="btn btn-xs btn-outline-primary font-monospace fw-semibold"
              style={{ fontSize: '0.78rem' }}
            >
              Manage POS Days
            </button>
          )}
        </div>
      </div>

      <div className="row g-3">
        
        {/* Left Column: Menu Categories & Fast Item Catalog */}
        <div className="col-12 col-lg-7 col-xl-8">
          
          {/* Top Search & Category Filter Bar */}
          <div className={`card border-0 shadow-sm p-3 mb-3 rounded-3 sticky-top ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`} style={{ top: '75px', zIndex: 10 }}>
            <div className="row g-2 align-items-center mb-3">
              
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0">
                    <Search className="w-4 h-4 text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search food by name, SKU (e.g. BISTRO-M101) or Barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="input-group-text bg-transparent">
                    <Barcode className="w-4 h-4 text-muted" />
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-4 text-end">
                <span className="badge bg-light text-dark border p-2 w-100 text-center">
                  Showing {filteredMenuItems.length} Menu Items
                </span>
              </div>

            </div>

            {/* Category Pills Slider */}
            <div className="d-flex align-items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`btn btn-sm text-nowrap rounded-pill px-3 py-1.5 ${
                  selectedCategory === 'all' ? 'btn-primary shadow-sm fw-semibold' : 'btn-outline-secondary'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn btn-sm text-nowrap rounded-pill px-3 py-1.5 ${
                    selectedCategory === cat.id ? 'btn-primary shadow-sm fw-semibold' : 'btn-outline-secondary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

          </div>

          {/* Menu Items Grid */}
          <div className="row g-3">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="col-6 col-md-4 col-xl-3">
                <div
                  onClick={(e) => handleDirectAddToCart(item, e)}
                  className={`card h-100 border-0 shadow-sm rounded-3 cursor-pointer overflow-hidden hover-lift transition-all ${
                    isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'
                  }`}
                >
                  <div className="position-relative" style={{ height: '120px' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-100 h-100 object-cover"
                    />
                    <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 backdrop-blur font-monospace">
                      {settings.currencySymbol}{item.sellingPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '0.88rem' }}>{item.name}</h6>
                      <p className="text-muted small line-clamp-2 mb-2" style={{ fontSize: '0.75rem' }}>{item.description}</p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                      <span className="badge bg-secondary-subtle text-secondary style-badge" style={{ fontSize: '0.65rem' }}>
                        {item.prepTimeMinutes}m prep
                      </span>

                      <button
                        onClick={(e) => handleDirectAddToCart(item, e)}
                        className="btn btn-sm btn-primary rounded-circle p-1 d-flex align-items-center justify-content-center"
                        style={{ width: '28px', height: '28px' }}
                        title="Add to cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: POS Cart, Order Channel, Discounts & Payment */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div 
            className={`card border-0 shadow-sm p-3 rounded-3 sticky-top ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`} 
            style={{ top: '75px', height: 'calc(100vh - 95px)', maxHeight: 'calc(100vh - 95px)', display: 'flex', flexDirection: 'column' }}
          >
            
            {/* Active Editing Banner for Loaded Last Orders */}
            {editingOrderNumber && (
              <div className="alert alert-warning py-1.5 px-2.5 mb-2 d-flex align-items-center justify-content-between rounded-3 shadow-sm border-warning flex-shrink-0">
                <div>
                  <span className="fw-bold d-block small">Editing Order {editingOrderNumber}</span>
                  <span className="text-dark opacity-75 style-badge" style={{ fontSize: '0.68rem' }}>
                    Click menu items to add new items
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-xs btn-outline-dark fw-bold rounded-pill px-2 py-0.5 ms-2"
                  onClick={() => {
                    setEditingOrderId(null);
                    setEditingOrderNumber(null);
                    setCartItems([]);
                    if (onClearLoadedOrder) onClearLoadedOrder();
                  }}
                  title="Clear loaded order & start fresh cart"
                >
                  New Order
                </button>
              </div>
            )}

            {/* Header / Held Orders Button */}
            <div className="d-flex align-items-center justify-content-between mb-2 border-bottom pb-2 flex-shrink-0">
              <h5 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span>Current Order Cart</span>
              </h5>

              <div className="d-flex align-items-center gap-1.5">
                {(cartItems.length > 0 || appliedDiscount > 0 || selectedTableId || editingOrderId) && (
                  <button
                    onClick={handleClearAllPos}
                    className="btn btn-xs btn-outline-danger fw-bold d-flex align-items-center gap-1 px-2 py-1"
                    title="Clear all POS cart items, discounts, and table selection"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>CLEAR ALL POS</span>
                  </button>
                )}

                {heldOrders.length > 0 && (
                  <button
                    onClick={() => setShowHoldModal(true)}
                    className="btn btn-sm btn-warning text-dark fw-bold position-relative px-2.5 py-0.5"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <PauseCircle className="w-3.5 h-3.5 d-inline me-1" />
                    <span>Held ({heldOrders.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Order Channel Selector (Dine In / Takeaway / Delivery) */}
            <div className="mb-2 flex-shrink-0">
              <div className="btn-group w-100 mb-1.5">
                {(['Dine In', 'Take Away', 'Delivery'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`btn btn-sm py-1 fw-semibold ${orderType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Waiter Selector */}
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Select Waiter:</span>
                <select
                  className="form-select form-select-sm font-monospace fw-bold text-primary py-1"
                  value={selectedWaiter}
                  onChange={(e) => setSelectedWaiter(e.target.value)}
                  style={{ fontSize: '0.78rem' }}
                >
                  <option value="">-- Select Waiter --</option>
                  {waiterList.map((w, idx) => (
                    <option key={idx} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List (Scrollable Area) */}
            <div className="cart-items-list mb-2 border rounded p-2 overflow-auto" style={{ flex: '1 1 auto', minHeight: '80px', overflowY: 'auto' }}>
              {cartItems.length === 0 ? (
                <div className="text-center py-2.5 text-muted">
                  <Utensils className="w-5 h-5 mb-1 opacity-50 stroke-1 mx-auto d-block" />
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Cart is empty</div>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="p-1.5 border-bottom last-border-0 mb-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-bold small text-truncate" style={{ maxWidth: '170px' }}>{item.name}</span>
                      <span className="fw-bold font-monospace text-primary small">${item.subtotal.toFixed(2)}</span>
                    </div>

                    {item.selectedVariant && (
                      <div className="text-muted style-badge mb-0.5" style={{ fontSize: '0.68rem' }}>Variant: {item.selectedVariant.name}</div>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-muted style-badge mb-0.5" style={{ fontSize: '0.68rem' }}>
                        Addons: {item.selectedAddons.map(a => a.name).join(', ')}
                      </div>
                    )}

                    <div className="d-flex align-items-center justify-content-between mt-1">
                      <div className="d-flex align-items-center gap-1">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="btn btn-sm btn-light border p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '22px', height: '22px' }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="fw-bold px-1.5 small font-monospace" style={{ fontSize: '0.8rem' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="btn btn-sm btn-light border p-0 d-flex align-items-center justify-content-center"
                          style={{ width: '22px', height: '22px' }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="btn btn-sm text-danger p-0"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Pinned Controls Section */}
            <div className="flex-shrink-0">
              {/* Bill Summary Calculations */}
              <div className={`p-2.5 rounded-3 mb-2 font-monospace border ${isDarkMode ? 'bg-secondary bg-opacity-20 border-secondary' : 'bg-light border-light-subtle'}`} style={{ fontSize: '0.88rem' }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Tax ({settings.taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Service Fee ({settings.serviceChargeRate}%):</span>
                  <span>${serviceCharge.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-danger fw-bold">
                    <span>Discount:</span>
                    <span>-${appliedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between fw-bold border-top pt-1.5 mt-1.5 mb-0 text-dark" style={{ fontSize: '0.98rem' }}>
                  <span>TOTAL DUE:</span>
                  <span className="text-primary fw-bold">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              {/* POS Small Compact Action Buttons (Hold, Clear) */}
              <div className="d-flex align-items-center gap-2 mb-2">
                <button
                  onClick={handleHoldCurrentCart}
                  disabled={cartItems.length === 0}
                  className="btn btn-sm btn-outline-warning text-dark flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1.5 py-1.5 px-2"
                  style={{ fontSize: '0.78rem' }}
                  title="Hold current order"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Hold Order</span>
                </button>

                <button
                  onClick={handleClearAllPos}
                  disabled={cartItems.length === 0 && appliedDiscount === 0 && !selectedTableId}
                  className="btn btn-sm btn-outline-danger flex-fill fw-semibold d-flex align-items-center justify-content-center gap-1.5 py-1.5 px-2"
                  style={{ fontSize: '0.78rem' }}
                  title="Clear all POS cart items, discounts, and reset order"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>CLEAR ALL POS</span>
                </button>
              </div>

              {/* Always-Visible Fixed Pay Now Button */}
              <div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cartItems.length === 0}
                  className="btn btn-success btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow py-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>PAY NOW ({settings.currencySymbol}{totalAmount.toFixed(2)})</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Item Customization Variant / Addon Modal */}
      {activeItemForCustomization && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title h6 fw-bold">{activeItemForCustomization.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveItemForCustomization(null)}></button>
              </div>

              <div className="modal-body p-4">
                {/* Variants Radio */}
                {activeItemForCustomization.variants && activeItemForCustomization.variants.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase">Portion / Variant Size</label>
                    <div className="list-group">
                      {activeItemForCustomization.variants.map((v) => (
                        <label key={v.id} className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                          <div>
                            <input
                              type="radio"
                              name="variant"
                              className="form-check-input me-2"
                              checked={selectedVariant?.id === v.id}
                              onChange={() => setSelectedVariant(v)}
                            />
                            <span>{v.name}</span>
                          </div>
                          <span className="fw-bold font-monospace">
                            {v.priceDelta > 0 ? `+$${v.priceDelta.toFixed(2)}` : 'Standard'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addons Checkbox */}
                {activeItemForCustomization.addons && activeItemForCustomization.addons.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-bold small text-muted text-uppercase">Extra Add-ons</label>
                    <div className="list-group">
                      {activeItemForCustomization.addons.map((a) => {
                        const isChecked = selectedAddons.some(addon => addon.id === a.id);
                        return (
                          <label key={a.id} className="list-group-item d-flex justify-content-between align-items-center cursor-pointer">
                            <div>
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAddons(prev => [...prev, a]);
                                  } else {
                                    setSelectedAddons(prev => prev.filter(addon => addon.id !== a.id));
                                  }
                                }}
                              />
                              <span>{a.name}</span>
                            </div>
                            <span className="fw-bold font-monospace">+${a.price.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Kitchen Special Request */}
                <div>
                  <label className="form-label fw-bold small text-muted text-uppercase">Kitchen Special Request</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., No onion, extra spicy bisbaas..."
                    value={itemKitchenNote}
                    onChange={(e) => setItemKitchenNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-primary w-100 fw-bold" onClick={handleConfirmAddToCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <PaymentModal
          orderTotal={totalAmount}
          customerPhone={loadedOrder?.customerPhone}
          settings={settings}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Printable Thermal Receipt Modal */}
      {completedOrderForReceipt && (
        <ReceiptModal
          order={completedOrderForReceipt}
          settings={settings}
          onClose={() => setCompletedOrderForReceipt(null)}
        />
      )}

      {/* Held Orders Queue Modal */}
      {showHoldModal && (
        <HoldOrdersModal
          heldOrders={heldOrders}
          onResumeOrder={(ord) => {
            onResumeHeldOrder(ord);
            setCartItems(ord.items);
            setShowHoldModal(false);
          }}
          onDeleteOrder={(id) => onDeleteHeldOrder(id)}
          onClose={() => setShowHoldModal(false)}
        />
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
        <SplitBillModal
          totalAmount={totalAmount}
          cartItems={cartItems}
          settings={settings}
          onClose={() => setShowSplitModal(false)}
        />
      )}

    </div>
  );
};
