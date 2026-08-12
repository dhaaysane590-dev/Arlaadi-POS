import {
  User,
  MenuCategory,
  MenuItem,
  RestaurantTable,
  Order,
  Ingredient,
  Supplier,
  Customer,
  Reservation,
  DeliveryDriver,
  Employee,
  Expense,
  DailyClosing,
  ActivityLog,
  RestaurantSettings,
  RestaurantTenant
} from '../types';

export const initialTenants: RestaurantTenant[] = [
  {
    id: 'rest-1',
    code: 'REST-001',
    name: 'Palace Gourmet Bistro & Lounge',
    ownerName: 'Fatima Omar',
    username: 'palace_bistro',
    pin: '1234',
    email: 'fatima@palacebistro.com',
    phone: '+252 61 555 8899',
    address: 'KM4 Square, Maka Al-Mukarama Street, Mogadishu',
    plan: 'Enterprise',
    status: 'Active',
    currencySymbol: '$',
    taxRate: 5,
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
    createdAt: '2025-01-15',
    features: {
      pos: true,
      kds: true,
      inventory: true,
      floors: true,
      customer_site: true,
      reservations: true,
      delivery: true,
      accounting: true,
      reports: true,
      employees: true,
      pos_days: true,
      app_settings: true,
      business_settings: true,
      setups: true,
      user_management: true,
      receipts: true,
      food_menus: true,
      day_operation: true
    }
  },
  {
    id: 'rest-2',
    code: 'REST-002',
    name: 'Mogadishu Grill & Seafood House',
    ownerName: 'Hassan Ali',
    username: 'mogadishu_grill',
    pin: '2222',
    email: 'hassan@mogadishugrill.com',
    phone: '+252 61 666 1122',
    address: 'Lido Beach Road, Mogadishu',
    plan: 'Pro',
    status: 'Active',
    currencySymbol: '$',
    taxRate: 10,
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=160&q=80',
    createdAt: '2025-03-10',
    features: {
      pos: true,
      kds: true,
      inventory: true,
      floors: true,
      customer_site: true,
      reservations: false,
      delivery: true,
      accounting: false,
      reports: true,
      employees: true,
      pos_days: true,
      app_settings: true,
      business_settings: true,
      setups: true,
      user_management: true,
      receipts: true,
      food_menus: true,
      day_operation: true
    }
  },
  {
    id: 'rest-3',
    code: 'REST-003',
    name: 'Liido Beach Ocean Lounge & Bar',
    ownerName: 'Asha Mohamed',
    username: 'liido_lounge',
    pin: '3333',
    email: 'asha@liidolounge.so',
    phone: '+252 61 777 3344',
    address: 'Ocean View Strip, Liido Beach',
    plan: 'Starter',
    status: 'Active',
    currencySymbol: '$',
    taxRate: 0,
    logo: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=160&q=80',
    createdAt: '2025-05-01',
    features: {
      pos: true,
      kds: false,
      inventory: false,
      floors: true,
      customer_site: true,
      reservations: true,
      delivery: false,
      accounting: false,
      reports: false,
      employees: false,
      pos_days: true,
      app_settings: true,
      business_settings: false,
      setups: true,
      user_management: false,
      receipts: true,
      food_menus: true,
      day_operation: true
    }
  },
  {
    id: 'rest-4',
    code: 'REST-004',
    name: 'Hargeisa Heights Specialty Coffee',
    ownerName: 'Mohamed Nur',
    email: 'mohamed@hargeisaheights.com',
    phone: '+252 63 444 8899',
    address: 'Main Highway, Hargeisa',
    plan: 'Pro',
    status: 'Trial',
    currencySymbol: '$',
    taxRate: 2,
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-07-20',
    features: {
      pos: true,
      kds: true,
      inventory: true,
      floors: false,
      customer_site: true,
      reservations: false,
      delivery: false,
      accounting: true,
      reports: true,
      employees: true,
      pos_days: true,
      app_settings: true,
      business_settings: true,
      setups: true,
      user_management: true,
      receipts: true,
      food_menus: true,
      day_operation: true
    }
  }
];

export const initialSettings: RestaurantSettings = {
  name: 'Palace Gourmet Bistro & Lounge',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
  address: 'KM4 Square, Maka Al-Mukarama Street, Mogadishu',
  phone: '+252 61 555 8899',
  email: 'info@palacebistro.com',
  taxNumber: 'TAX-2026-9901',
  taxRate: 5, // 5%
  serviceChargeRate: 3, // 3%
  currencySymbol: '$',
  currencyCode: 'USD',
  timezone: 'Africa/Mogadishu',
  receiptHeader: 'Thank you for dining with Palace Gourmet!',
  receiptFooter: 'Waad ku mahadsan tahay Mar labaad noo soo laabo!!',
  enableThermalPrinter: true,
  receiptPrinterModel: 'Epson TM-T88VI',
  receiptPaperWidth: '80mm',
  receiptFontSize: 12,
  merchantCode: 'merchant : *789*693364*$$#',
  evcMerchantId: '615749110',
  evcApiKey: 'evc_secret_live_883291',
  edahabMerchantId: '625749110',
  mycashMerchantId: '615749110',
  zaadMerchantId: 'ZAAD-MER-5510',
  sahalMerchantId: 'SAHAL-MOG-7720',
  premierWalletId: 'PW-88192-2026',
  enableAutoIngredientDeduction: true,
  enableKdsSoundAlerts: true,
  loginTitle: 'Qado Dalbo - Institute Portal',
  loginTagline: 'QADADAADA, HAL TAABASHO.',
  loginLogo: '',
  loginAddress: 'Mogadishu, Somalia',
  loginPhone: '+252 61 3494935',
  loginFooterText: 'Software Provided By Arlaadi ICT Solution © 2026',
  loginAnnouncement: '',
  loginBgStyle: 'blue_gradient',
  loginButtonColor: '#2b7fff',
  loginShowQuickLogin: true,
  loginShowProfileSelector: false,
  loginShowLogo: true,
  kitchenPrinters: [
    {
      id: 'kp-1',
      stationName: 'Hot Kitchen Station',
      printerType: 'Network IP (LAN/Wi-Fi)',
      printerModel: 'Epson TM-T88VI',
      ipAddress: '192.168.1.120',
      port: 9100,
      printerQueueName: 'EPSON_TM_T88VI_Kitchen',
      paperWidth: '80mm',
      assignedCategories: ['Main Dishes', 'Pasta & Pizza', 'Soups & Starters'],
      autoPrintKot: true,
      status: 'Online'
    },
    {
      id: 'kp-2',
      stationName: 'Beverage & Bar Counter',
      printerType: 'Thermal USB / Print Queue',
      printerModel: 'Bixolon SRP-350III',
      ipAddress: '192.168.1.125',
      port: 9100,
      printerQueueName: 'Bar_Thermal_POS80',
      paperWidth: '80mm',
      assignedCategories: ['Beverages & Juice', 'Coffee & Tea', 'Desserts'],
      autoPrintKot: true,
      status: 'Online'
    },
    {
      id: 'kp-3',
      stationName: 'Grill & BBQ Station',
      printerType: 'Network IP (LAN/Wi-Fi)',
      printerModel: 'Star Micronics TSP100',
      ipAddress: '192.168.1.130',
      port: 9100,
      printerQueueName: 'Star_TSP100_Grill',
      paperWidth: '80mm',
      assignedCategories: ['Barbecue & Meats'],
      autoPrintKot: false,
      status: 'Offline'
    }
  ]
};

export const currentUserProfiles: User[] = [
  {
    id: 'u-1',
    name: 'Ahmed Hassan (Super Admin)',
    email: 'admin@palacebistro.com',
    role: 'Super Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    phone: '+252 61 500 0001',
    pin: '4453'
  },
  {
    id: 'u-2',
    name: 'Fatima Omar (Owner - Palace Bistro)',
    email: 'fatima@palacebistro.com',
    role: 'Restaurant Owner',
    tenantId: 'rest-1',
    branchId: 'rest-1',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    pin: '1111'
  },
  {
    id: 'u-3',
    name: 'Youssef Ali (Manager - Palace Bistro)',
    email: 'youssef@palacebistro.com',
    role: 'Branch Manager',
    tenantId: 'rest-1',
    branchId: 'rest-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    pin: '2222'
  },
  {
    id: 'u-4',
    name: 'Amina Abdi (Cashier - Palace Bistro)',
    email: 'amina@palacebistro.com',
    role: 'Cashier',
    tenantId: 'rest-1',
    branchId: 'rest-1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    pin: '3333'
  },
  {
    id: 'u-5',
    name: 'Mohamed Farah (Waiter - Palace Bistro)',
    email: 'mohamed@palacebistro.com',
    role: 'Waiter',
    tenantId: 'rest-1',
    branchId: 'rest-1',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    pin: '4444'
  },
  {
    id: 'u-6',
    name: 'Chef Tariq Ziyad (Head Chef - Palace Bistro)',
    email: 'chef@palacebistro.com',
    role: 'Kitchen Staff',
    tenantId: 'rest-1',
    branchId: 'rest-1',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
    pin: '5555'
  },
  {
    id: 'u-7',
    name: 'Hassan Ali (Owner - Mogadishu Grill)',
    email: 'hassan@mogadishugrill.com',
    role: 'Restaurant Owner',
    tenantId: 'rest-2',
    branchId: 'rest-2',
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=120&q=80',
    pin: '2222'
  },
  {
    id: 'u-8',
    name: 'Jama Farah (Manager - Mogadishu Grill)',
    email: 'jama@mogadishugrill.com',
    role: 'Branch Manager',
    tenantId: 'rest-2',
    branchId: 'rest-2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    pin: '2223'
  },
  {
    id: 'u-9',
    name: 'Asha Mohamed (Owner - Liido Lounge)',
    email: 'asha@liidolounge.so',
    role: 'Restaurant Owner',
    tenantId: 'rest-3',
    branchId: 'rest-3',
    avatar: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=120&q=80',
    pin: '3333'
  }
];

export const initialCategories: MenuCategory[] = [];

export const initialIngredients: Ingredient[] = [];

export const initialMenuItems: MenuItem[] = [];

export const initialTables: RestaurantTable[] = [];

export const initialOrders: Order[] = [];

export const initialSuppliers: Supplier[] = [];

export const initialCustomers: Customer[] = [];

export const initialReservations: Reservation[] = [];

export const initialDrivers: DeliveryDriver[] = [];

export const initialEmployees: Employee[] = [];

export const initialExpenses: Expense[] = [];

export const initialDailyClosing: DailyClosing = {
  id: 'close-init',
  date: new Date().toISOString().split('T')[0],
  openingCash: 0,
  cashSales: 0,
  cardSales: 0,
  mobileMoneySales: 0,
  totalRevenue: 0,
  actualCashInHand: 0,
  difference: 0,
  closedBy: 'System',
  notes: ''
};

export const initialLogs: ActivityLog[] = [];
