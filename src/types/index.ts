// Restaurant Management System - TypeScript Definitions

export type RestaurantFeatureKey =
  | 'pos'
  | 'kds'
  | 'inventory'
  | 'floors'
  | 'customer_site'
  | 'reservations'
  | 'delivery'
  | 'accounting'
  | 'reports'
  | 'employees'
  | 'pos_days'
  | 'app_settings'
  | 'business_settings'
  | 'setups'
  | 'user_management'
  | 'receipts'
  | 'food_menus'
  | 'day_operation';

export type RestaurantFeatures = Record<RestaurantFeatureKey, boolean>;

export type UserRole = 
  | 'Super Admin'
  | 'Restaurant Owner'
  | 'Branch Manager'
  | 'Cashier'
  | 'Waiter'
  | 'Kitchen Staff'
  | 'Inventory Manager'
  | 'Accountant'
  | 'Shift Supervisor'
  | 'Delivery Driver'
  | 'Customer';

export type RolePermissions = Record<string, Record<RestaurantFeatureKey, boolean>>;

export interface RestaurantTenant {
  id: string;
  code: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Custom';
  status: 'Active' | 'Suspended' | 'Trial' | 'Expired';
  currencySymbol: string;
  taxRate: number;
  logo: string;
  createdAt: string;
  features: RestaurantFeatures;
  rolePermissions?: RolePermissions;
  username?: string;
  pin?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  branchId?: string;
  tenantId?: string;
  pin?: string;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  priceDelta: number;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityRequired: number; // e.g. 0.25 kg or 1 pcs
}

export interface MenuItem {
  id: string;
  tenantId?: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  taxRate: number; // percentage
  prepTimeMinutes: number;
  isAvailable: boolean;
  image: string;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  allergens?: string[];
  recipe?: RecipeIngredient[];
}

export interface MenuCategory {
  id: string;
  tenantId?: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
}

export interface RestaurantTable {
  id: string;
  tenantId?: string;
  tableNumber: string;
  area: 'Main Hall' | 'VIP Lounge' | 'Terrace' | 'Bar Area';
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';
  currentOrderId?: string;
  qrCodeUrl?: string;
  mergedWith?: string[];
}

export type OrderType = 'Dine In' | 'Take Away' | 'Delivery' | 'Online';

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export type PaymentMethod = 'Cash' | 'Card' | 'EVC Plus' | 'E-Dahab' | 'Mycash' | 'Merchant' | 'ZAAD' | 'Sahal' | 'Premier Wallet' | 'Bank Transfer';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Partially Paid' | 'Refunded';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddons?: MenuItemAddon[];
  kitchenNotes?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  tenantId?: string;
  orderNumber: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryDriverId?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  couponCode?: string;
  serviceCharge: number;
  tipAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  waiterName?: string;
  kitchenNotes?: string;
  isHeld?: boolean;
}

export interface Ingredient {
  id: string;
  tenantId?: string;
  name: string;
  code: string;
  category: string;
  unit: 'kg' | 'g' | 'liters' | 'ml' | 'pcs' | 'packs' | 'boxes';
  stockQuantity: number;
  minThreshold: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  lastRestocked: string;
  expiryDate?: string;
}

export interface StockTransaction {
  id: string;
  tenantId?: string;
  ingredientId: string;
  ingredientName: string;
  type: 'Stock In' | 'Stock Out' | 'Adjustment' | 'Wastage';
  quantity: number;
  reason: string;
  createdAt: string;
  createdByName: string;
}

export interface Supplier {
  id: string;
  tenantId?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  balanceOwed: number;
}

export interface Customer {
  id: string;
  tenantId?: string;
  name: string;
  phone: string;
  email: string;
  membershipLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  loyaltyPoints: number;
  walletBalance: number;
  totalOrdersCount: number;
  totalSpent: number;
  notes?: string;
}

export interface Reservation {
  id: string;
  tenantId?: string;
  customerName: string;
  phone: string;
  guestsCount: number;
  reservationDate: string;
  reservationTime: string;
  tableId?: string;
  tableName?: string;
  area?: string;
  status: 'Pending' | 'Confirmed' | 'Seated' | 'Cancelled';
  notes?: string;
}

export interface DeliveryDriver {
  id: string;
  tenantId?: string;
  name: string;
  phone: string;
  vehicleType: string;
  status: 'Available' | 'On Delivery' | 'Offline';
  activeOrdersCount: number;
}

export interface Employee {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: UserRole;
  salary: number;
  shift: 'Morning' | 'Evening' | 'Night' | 'Full Day';
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface AttendanceRecord {
  id: string;
  tenantId?: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
}

export interface Expense {
  id: string;
  tenantId?: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Ingredients' | 'Maintenance' | 'Marketing' | 'Misc';
  title: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  recordedBy: string;
}

export interface DailyClosing {
  id: string;
  tenantId?: string;
  date: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  mobileMoneySales: number;
  totalRevenue: number;
  actualCashInHand: number;
  difference: number; // positive = overage, negative = shortage
  closedBy: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  tenantId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface KitchenPrinterStation {
  id: string;
  stationName: string; // e.g. "Main Hot Kitchen", "Bar Counter", "Grill & BBQ"
  printerType: 'Network IP (LAN/Wi-Fi)' | 'Thermal USB / Print Queue' | 'Bluetooth Thermal';
  printerModel?: string; // e.g. "Epson TM-T88VI", "Star TSP100", "Bixolon SRP-350III", "Xprinter XP-N160I"
  ipAddress?: string; // e.g. "192.168.1.150"
  port?: number; // e.g. 9100
  printerQueueName?: string; // e.g. "EPSON_TM_T88VI_Kitchen" or "POS80_Bar_Printer"
  paperWidth?: '80mm' | '58mm';
  assignedCategories?: string[]; // Category names routed to this printer
  autoPrintKot: boolean;
  status?: 'Online' | 'Offline' | 'Test Mode';
}

export interface RestaurantSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  taxRate: number; // percentage e.g. 10
  serviceChargeRate: number; // percentage e.g. 5
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  receiptHeader: string;
  receiptFooter: string;
  enableThermalPrinter: boolean;
  receiptPrinterModel?: string;
  receiptPaperWidth?: '80mm' | '58mm';
  receiptFontSize?: number; // Base font size for thermal receipts in px (10px to 16px)
  merchantCode?: string;
  evcMerchantId: string;
  evcApiKey: string;
  edahabMerchantId?: string;
  mycashMerchantId?: string;
  zaadMerchantId: string;
  sahalMerchantId: string;
  premierWalletId: string;
  enableAutoIngredientDeduction: boolean;
  enableKdsSoundAlerts: boolean;
  kitchenPrinters?: KitchenPrinterStation[];
  // Front Login Page Customization Settings
  loginTitle?: string;
  loginTagline?: string;
  loginLogo?: string;
  loginAddress?: string;
  loginPhone?: string;
  loginFooterText?: string;
  loginAnnouncement?: string;
  loginBgStyle?: 'blue_gradient' | 'emerald_dark' | 'indigo_purple' | 'slate_modern' | 'warm_sunset' | 'clean_light';
  loginButtonColor?: string;
  loginShowQuickLogin?: boolean;
  loginShowProfileSelector?: boolean;
  loginShowLogo?: boolean;
}
