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

export const initialCategories: MenuCategory[] = [
  { id: 'cat-1', name: 'Main Courses', icon: 'Utensils', description: 'Gourmet grills, traditional stews & rice platters', itemCount: 6 },
  { id: 'cat-2', name: 'Pizza & Pasta', icon: 'Pizza', description: 'Woodfired artisan pizzas & handmade pastas', itemCount: 5 },
  { id: 'cat-3', name: 'Burgers & Wraps', icon: 'Sandwich', description: 'Angus beef burgers, grilled chicken wraps', itemCount: 4 },
  { id: 'cat-4', name: 'Starters & Salads', icon: 'Salad', description: 'Fresh Mediterranean salads & crispy appetizers', itemCount: 4 },
  { id: 'cat-5', name: 'Desserts & Sweets', icon: 'IceCream', description: 'Baklava, cakes, soufflés and gelato', itemCount: 3 },
  { id: 'cat-6', name: 'Hot & Cold Drinks', icon: 'Coffee', description: 'Fresh juices, espresso drinks & smoothies', itemCount: 5 },
];

export const initialIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Basmati Rice', code: 'ING-01', category: 'Grains', unit: 'kg', stockQuantity: 85, minThreshold: 20, unitCost: 2.20, supplierId: 'sup-1', supplierName: 'Somali Grain Traders', lastRestocked: '2026-08-01' },
  { id: 'ing-2', name: 'Prime Beef Tenderloin', code: 'ING-02', category: 'Meat', unit: 'kg', stockQuantity: 18, minThreshold: 10, unitCost: 8.50, supplierId: 'sup-2', supplierName: 'Mogadishu Prime Meats', lastRestocked: '2026-08-03' },
  { id: 'ing-3', name: 'Fresh Goat Meat', code: 'ING-03', category: 'Meat', unit: 'kg', stockQuantity: 12, minThreshold: 15, unitCost: 9.00, supplierId: 'sup-2', supplierName: 'Mogadishu Prime Meats', lastRestocked: '2026-08-02' },
  { id: 'ing-4', name: 'Mozzarella Cheese', code: 'ING-04', category: 'Dairy', unit: 'kg', stockQuantity: 8.5, minThreshold: 10, unitCost: 6.80, supplierId: 'sup-3', supplierName: 'Global Dairy Import', lastRestocked: '2026-08-01' },
  { id: 'ing-5', name: 'Olive Oil Extra Virgin', code: 'ING-05', category: 'Oils', unit: 'liters', stockQuantity: 25, minThreshold: 5, unitCost: 7.20, supplierId: 'sup-3', supplierName: 'Global Dairy Import', lastRestocked: '2026-07-28' },
  { id: 'ing-6', name: 'Fresh Tomatoes', code: 'ING-06', category: 'Produce', unit: 'kg', stockQuantity: 30, minThreshold: 10, unitCost: 1.50, supplierId: 'sup-4', supplierName: 'Km4 Fresh Vegetables', lastRestocked: '2026-08-04' },
  { id: 'ing-7', name: 'Chicken Breast', code: 'ING-07', category: 'Poultry', unit: 'kg', stockQuantity: 22, minThreshold: 8, unitCost: 5.40, supplierId: 'sup-2', supplierName: 'Mogadishu Prime Meats', lastRestocked: '2026-08-03' },
  { id: 'ing-8', name: 'Espresso Coffee Beans', code: 'ING-08', category: 'Beverages', unit: 'kg', stockQuantity: 14, minThreshold: 4, unitCost: 12.00, supplierId: 'sup-1', supplierName: 'Somali Grain Traders', lastRestocked: '2026-07-25' }
];

export const initialMenuItems: MenuItem[] = [
  {
    id: 'm-101',
    sku: 'BISTRO-M101',
    barcode: '89300100101',
    name: 'Somali Goat Suqaar with Bariis',
    categoryId: 'cat-1',
    categoryName: 'Main Courses',
    description: 'Tender diced goat meat sautéed with bell peppers, potatoes, Somali spices, served with fragrant Basmati rice and banana.',
    costPrice: 4.50,
    sellingPrice: 12.00,
    taxRate: 5,
    prepTimeMinutes: 15,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    allergens: ['Garlic', 'Onion'],
    recipe: [
      { ingredientId: 'ing-1', quantityRequired: 0.3 }, // 300g rice
      { ingredientId: 'ing-3', quantityRequired: 0.25 }, // 250g goat meat
      { ingredientId: 'ing-5', quantityRequired: 0.02 } // 20ml olive oil
    ],
    variants: [
      { id: 'v-1', name: 'Standard Portion', priceDelta: 0 },
      { id: 'v-2', name: 'Large Double Meat', priceDelta: 4.50 }
    ],
    addons: [
      { id: 'a-1', name: 'Extra Banana', price: 0.50 },
      { id: 'a-2', name: 'Side Bisbaas Hot Sauce', price: 0.75 }
    ]
  },
  {
    id: 'm-102',
    sku: 'BISTRO-M102',
    barcode: '89300100102',
    name: 'Grilled Angus Beef Ribeye Steak',
    categoryId: 'cat-1',
    categoryName: 'Main Courses',
    description: '300g premium Angus Ribeye grilled to perfection with herb garlic butter, truffle fries & grilled asparagus.',
    costPrice: 9.80,
    sellingPrice: 24.50,
    taxRate: 5,
    prepTimeMinutes: 20,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    allergens: ['Dairy'],
    recipe: [
      { ingredientId: 'ing-2', quantityRequired: 0.32 },
      { ingredientId: 'ing-5', quantityRequired: 0.03 }
    ],
    variants: [
      { id: 'v-3', name: 'Medium Rare', priceDelta: 0 },
      { id: 'v-4', name: 'Medium Well', priceDelta: 0 },
      { id: 'v-5', name: 'Well Done', priceDelta: 0 }
    ],
    addons: [
      { id: 'a-3', name: 'Mushroom Cream Sauce', price: 2.00 },
      { id: 'a-4', name: 'Truffle Fries Upgrade', price: 2.50 }
    ]
  },
  {
    id: 'm-103',
    sku: 'BISTRO-M103',
    barcode: '89300100103',
    name: 'Woodfired Pizza Margherita Supreme',
    categoryId: 'cat-2',
    categoryName: 'Pizza & Pasta',
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, virgin olive oil & fresh basil leaves.',
    costPrice: 3.20,
    sellingPrice: 13.50,
    taxRate: 5,
    prepTimeMinutes: 12,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    allergens: ['Gluten', 'Dairy'],
    recipe: [
      { ingredientId: 'ing-4', quantityRequired: 0.2 },
      { ingredientId: 'ing-6', quantityRequired: 0.15 },
      { ingredientId: 'ing-5', quantityRequired: 0.02 }
    ],
    variants: [
      { id: 'v-6', name: 'Medium 12"', priceDelta: 0 },
      { id: 'v-7', name: 'Large Family 16"', priceDelta: 4.00 }
    ],
    addons: [
      { id: 'a-5', name: 'Extra Mozzarella Cheese', price: 2.00 },
      { id: 'a-6', name: 'Sliced Jalapeños', price: 1.00 }
    ]
  },
  {
    id: 'm-104',
    sku: 'BISTRO-M104',
    barcode: '89300100104',
    name: 'Creamy Chicken Alfredo Penne',
    categoryId: 'cat-2',
    categoryName: 'Pizza & Pasta',
    description: 'Al dente penne pasta tossed in rich parmesan cream sauce, grilled chicken breast & wild mushrooms.',
    costPrice: 4.10,
    sellingPrice: 14.00,
    taxRate: 5,
    prepTimeMinutes: 14,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3def6164286?auto=format&fit=crop&w=600&q=80',
    allergens: ['Gluten', 'Dairy'],
    recipe: [
      { ingredientId: 'ing-7', quantityRequired: 0.2 },
      { ingredientId: 'ing-4', quantityRequired: 0.08 }
    ]
  },
  {
    id: 'm-105',
    sku: 'BISTRO-M105',
    barcode: '89300100105',
    name: 'Smoky Double Cheeseburger',
    categoryId: 'cat-3',
    categoryName: 'Burgers & Wraps',
    description: 'Two smashed beef patties, cheddar cheese, smoked beef bacon, caramelized onion jam & secret bistro sauce on brioche bun.',
    costPrice: 3.80,
    sellingPrice: 11.50,
    taxRate: 5,
    prepTimeMinutes: 10,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    allergens: ['Gluten', 'Dairy'],
    recipe: [
      { ingredientId: 'ing-2', quantityRequired: 0.22 },
      { ingredientId: 'ing-4', quantityRequired: 0.05 }
    ]
  },
  {
    id: 'm-106',
    sku: 'BISTRO-M106',
    barcode: '89300100106',
    name: 'Crispy Falafel & Hummus Starter Platter',
    categoryId: 'cat-4',
    categoryName: 'Starters & Salads',
    description: 'Homemade chickpea falafels, creamy tahini hummus, pickled turnips, pita bread & zaatar spice.',
    costPrice: 2.10,
    sellingPrice: 8.50,
    taxRate: 5,
    prepTimeMinutes: 8,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    allergens: ['Sesame', 'Gluten']
  },
  {
    id: 'm-107',
    sku: 'BISTRO-M107',
    barcode: '89300100107',
    name: 'Turkish Honey Baklava with Vanilla Gelato',
    categoryId: 'cat-5',
    categoryName: 'Desserts & Sweets',
    description: 'Crispy layers of phyllo pastry filled with crushed pistachios & orange blossom syrup, served warm with gelato.',
    costPrice: 2.50,
    sellingPrice: 7.50,
    taxRate: 5,
    prepTimeMinutes: 5,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80',
    allergens: ['Nuts', 'Gluten', 'Dairy']
  },
  {
    id: 'm-108',
    sku: 'BISTRO-M108',
    barcode: '89300100108',
    name: 'Double Shot Caramel Iced Macchiato',
    categoryId: 'cat-6',
    categoryName: 'Hot & Cold Drinks',
    description: 'Freshly brewed double espresso shot over cold whole milk, vanilla bean syrup and salted caramel drizzle.',
    costPrice: 0.90,
    sellingPrice: 4.50,
    taxRate: 5,
    prepTimeMinutes: 4,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    recipe: [
      { ingredientId: 'ing-8', quantityRequired: 0.02 }
    ]
  },
  {
    id: 'm-109',
    sku: 'BISTRO-M109',
    barcode: '89300100109',
    name: 'Fresh Mango Passion Smoothie',
    categoryId: 'cat-6',
    categoryName: 'Hot & Cold Drinks',
    description: '100% natural Mogadishu ripe mangoes blended with passionfruit puree & coconut water.',
    costPrice: 1.10,
    sellingPrice: 5.00,
    taxRate: 5,
    prepTimeMinutes: 3,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
  }
];

export const initialTables: RestaurantTable[] = [
  { id: 'tbl-1', tableNumber: 'T-01', area: 'Main Hall', capacity: 2, status: 'Available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=T-01' },
  { id: 'tbl-2', tableNumber: 'T-02', area: 'Main Hall', capacity: 4, status: 'Occupied', currentOrderId: 'ord-1002', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=T-02' },
  { id: 'tbl-3', tableNumber: 'T-03', area: 'Main Hall', capacity: 4, status: 'Occupied', currentOrderId: 'ord-1001', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=T-03' },
  { id: 'tbl-4', tableNumber: 'T-04', area: 'Main Hall', capacity: 6, status: 'Reserved', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=T-04' },
  { id: 'tbl-5', tableNumber: 'VIP-1', area: 'VIP Lounge', capacity: 8, status: 'Occupied', currentOrderId: 'ord-1003', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=VIP-1' },
  { id: 'tbl-6', tableNumber: 'VIP-2', area: 'VIP Lounge', capacity: 10, status: 'Available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=VIP-2' },
  { id: 'tbl-7', tableNumber: 'TR-01', area: 'Terrace', capacity: 4, status: 'Available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=TR-01' },
  { id: 'tbl-8', tableNumber: 'TR-02', area: 'Terrace', capacity: 2, status: 'Cleaning', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=TR-02' },
  { id: 'tbl-9', tableNumber: 'BAR-1', area: 'Bar Area', capacity: 2, status: 'Available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=BAR-1' },
  { id: 'tbl-10', tableNumber: 'BAR-2', area: 'Bar Area', capacity: 2, status: 'Available', qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://palacebistro.com/menu?table=BAR-2' }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '#ORD-2026-1001',
    orderType: 'Dine In',
    tableId: 'tbl-3',
    tableName: 'T-03',
    customerName: 'Zahra Mohamed (VIP)',
    customerPhone: '+252 61 998 1234',
    items: [
      {
        id: 'oi-1',
        menuItemId: 'm-101',
        name: 'Somali Goat Suqaar with Bariis',
        unitPrice: 12.00,
        quantity: 2,
        selectedVariant: { id: 'v-1', name: 'Standard Portion', priceDelta: 0 },
        selectedAddons: [{ id: 'a-1', name: 'Extra Banana', price: 0.50 }],
        subtotal: 25.00,
        kitchenNotes: 'Extra spicy bisbaas sauce please'
      },
      {
        id: 'oi-2',
        menuItemId: 'm-108',
        name: 'Double Shot Caramel Iced Macchiato',
        unitPrice: 4.50,
        quantity: 2,
        subtotal: 9.00
      }
    ],
    subtotal: 34.00,
    taxAmount: 1.70,
    discountAmount: 3.40,
    couponCode: 'VIP10',
    serviceCharge: 1.02,
    tipAmount: 2.00,
    totalAmount: 35.32,
    paidAmount: 35.32,
    changeAmount: 0,
    paymentMethod: 'EVC Plus',
    paymentStatus: 'Paid',
    status: 'Preparing',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    waiterName: 'Mohamed Farah',
    kitchenNotes: 'Urgent table, VIP guest'
  },
  {
    id: 'ord-1002',
    orderNumber: '#ORD-2026-1002',
    orderType: 'Dine In',
    tableId: 'tbl-2',
    tableName: 'T-02',
    customerName: 'General Hassan',
    customerPhone: '+252 61 223 9900',
    items: [
      {
        id: 'oi-3',
        menuItemId: 'm-102',
        name: 'Grilled Angus Beef Ribeye Steak',
        unitPrice: 24.50,
        quantity: 1,
        selectedVariant: { id: 'v-3', name: 'Medium Rare', priceDelta: 0 },
        selectedAddons: [{ id: 'a-3', name: 'Mushroom Cream Sauce', price: 2.00 }],
        subtotal: 26.50
      },
      {
        id: 'oi-4',
        menuItemId: 'm-109',
        name: 'Fresh Mango Passion Smoothie',
        unitPrice: 5.00,
        quantity: 1,
        subtotal: 5.00
      }
    ],
    subtotal: 31.50,
    taxAmount: 1.58,
    discountAmount: 0,
    serviceCharge: 0.95,
    tipAmount: 0,
    totalAmount: 34.03,
    paidAmount: 0,
    changeAmount: 0,
    paymentStatus: 'Unpaid',
    status: 'Pending',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    waiterName: 'Mohamed Farah'
  },
  {
    id: 'ord-1003',
    orderNumber: '#ORD-2026-1003',
    orderType: 'Delivery',
    customerName: 'Engineering Office KM4',
    customerPhone: '+252 61 772 1100',
    customerAddress: 'Tower 4, Floor 3, Maka Al Mukarama Rd',
    items: [
      {
        id: 'oi-5',
        menuItemId: 'm-103',
        name: 'Woodfired Pizza Margherita Supreme',
        unitPrice: 13.50,
        quantity: 3,
        subtotal: 40.50
      },
      {
        id: 'oi-6',
        menuItemId: 'm-105',
        name: 'Smoky Double Cheeseburger',
        unitPrice: 11.50,
        quantity: 2,
        subtotal: 23.00
      }
    ],
    subtotal: 63.50,
    taxAmount: 3.18,
    discountAmount: 5.00,
    serviceCharge: 2.00, // Delivery fee
    tipAmount: 3.00,
    totalAmount: 66.68,
    paidAmount: 66.68,
    changeAmount: 0,
    paymentMethod: 'ZAAD',
    paymentStatus: 'Paid',
    status: 'Ready',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deliveryDriverId: 'drv-1'
  },
  {
    id: 'ord-1000',
    orderNumber: '#ORD-2026-1000',
    orderType: 'Take Away',
    customerName: 'Dr. Abdirahman',
    customerPhone: '+252 61 888 3344',
    items: [
      {
        id: 'oi-7',
        menuItemId: 'm-104',
        name: 'Creamy Chicken Alfredo Penne',
        unitPrice: 14.00,
        quantity: 1,
        subtotal: 14.00
      },
      {
        id: 'oi-8',
        menuItemId: 'm-107',
        name: 'Turkish Honey Baklava with Vanilla Gelato',
        unitPrice: 7.50,
        quantity: 1,
        subtotal: 7.50
      }
    ],
    subtotal: 21.50,
    taxAmount: 1.08,
    discountAmount: 0,
    serviceCharge: 0.65,
    tipAmount: 0,
    totalAmount: 23.23,
    paidAmount: 23.23,
    changeAmount: 0,
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    status: 'Completed',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  }
];

export const initialSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Somali Grain Traders', contactPerson: 'Sheikh Yusuf', email: 'sales@somaligrain.com', phone: '+252 61 511 2233', address: 'Bakaara Market Zone B', balanceOwed: 450.00 },
  { id: 'sup-2', name: 'Mogadishu Prime Meats', contactPerson: 'Osman Dahir', email: 'orders@primemeats.so', phone: '+252 61 522 3344', address: 'K4 Slaughterhouse Complex', balanceOwed: 1200.00 },
  { id: 'sup-3', name: 'Global Dairy Import', contactPerson: 'Naima Warsame', email: 'naima@globaldairy.so', phone: '+252 61 533 4455', address: 'Mogadishu Seaport Freezone', balanceOwed: 0.00 },
  { id: 'sup-4', name: 'Km4 Fresh Vegetables', contactPerson: 'Ali Jama', email: 'alijama@freshveg.so', phone: '+252 61 544 5566', address: 'Afgooye Farm Supply KM4', balanceOwed: 180.00 }
];

export const initialCustomers: Customer[] = [
  { id: 'cust-1', name: 'Zahra Mohamed', phone: '+252 61 998 1234', email: 'zahra@gmail.com', membershipLevel: 'Platinum', loyaltyPoints: 380, walletBalance: 150.00, totalOrdersCount: 24, totalSpent: 890.00, notes: 'Prefers quiet corner tables, allergic to peanuts' },
  { id: 'cust-2', name: 'General Hassan', phone: '+252 61 223 9900', email: 'hassan@gov.so', membershipLevel: 'Gold', loyaltyPoints: 210, walletBalance: 80.00, totalOrdersCount: 15, totalSpent: 520.00 },
  { id: 'cust-3', name: 'Engineering Office KM4', phone: '+252 61 772 1100', email: 'admin@km4engineers.com', membershipLevel: 'Silver', loyaltyPoints: 120, walletBalance: 0.00, totalOrdersCount: 8, totalSpent: 310.00 },
  { id: 'cust-4', name: 'Dr. Abdirahman', phone: '+252 61 888 3344', email: 'abdirahman@hospital.so', membershipLevel: 'Bronze', loyaltyPoints: 45, walletBalance: 25.00, totalOrdersCount: 3, totalSpent: 110.00 }
];

export const initialReservations: Reservation[] = [
  { id: 'res-1', customerName: 'Ambassador Liban', phone: '+252 61 990 0011', guestsCount: 6, reservationDate: new Date().toISOString().split('T')[0], reservationTime: '19:30', tableId: 'tbl-4', tableName: 'T-04', area: 'Main Hall', status: 'Confirmed', notes: 'Birthday celebration' },
  { id: 'res-2', customerName: 'Ministerial Delegation', phone: '+252 61 881 2299', guestsCount: 8, reservationDate: new Date().toISOString().split('T')[0], reservationTime: '20:00', tableId: 'tbl-5', tableName: 'VIP-1', area: 'VIP Lounge', status: 'Confirmed', notes: 'Private dinner setting required' },
  { id: 'res-3', customerName: 'Dr. Farhiya', phone: '+252 61 552 1188', guestsCount: 2, reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], reservationTime: '18:00', area: 'Terrace', status: 'Pending' }
];

export const initialDrivers: DeliveryDriver[] = [
  { id: 'drv-1', name: 'Ismael Nur (TukTuk #14)', phone: '+252 61 333 4411', vehicleType: 'Bajaj TukTuk', status: 'On Delivery', activeOrdersCount: 1 },
  { id: 'drv-2', name: 'Khadar Aden (Bike #02)', phone: '+252 61 333 5522', vehicleType: 'Motorcycle', status: 'Available', activeOrdersCount: 0 }
];

export const initialEmployees: Employee[] = [
  { id: 'emp-101', code: 'EMP-01', name: 'Ahmed Hassan', email: 'admin@palacebistro.com', phone: '+252 61 500 0001', department: 'Management', designation: 'General Director', role: 'Super Admin', salary: 2500, shift: 'Full Day', status: 'Active' },
  { id: 'emp-102', code: 'EMP-02', name: 'Youssef Ali', email: 'youssef@palacebistro.com', phone: '+252 61 500 0002', department: 'Operations', designation: 'Branch Manager', role: 'Branch Manager', salary: 1800, shift: 'Full Day', status: 'Active' },
  { id: 'emp-103', code: 'EMP-03', name: 'Chef Tariq Ziyad', email: 'chef@palacebistro.com', phone: '+252 61 500 0003', department: 'Kitchen', designation: 'Executive Chef', role: 'Kitchen Staff', salary: 1600, shift: 'Morning', status: 'Active' },
  { id: 'emp-104', code: 'EMP-04', name: 'Amina Abdi', email: 'amina@palacebistro.com', phone: '+252 61 500 0004', department: 'Front House', designation: 'Lead Cashier', role: 'Cashier', salary: 900, shift: 'Morning', status: 'Active' },
  { id: 'emp-105', code: 'EMP-05', name: 'Mohamed Farah', email: 'mohamed@palacebistro.com', phone: '+252 61 500 0005', department: 'Service', designation: 'Senior Waiter', role: 'Waiter', salary: 650, shift: 'Evening', status: 'Active' }
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', category: 'Ingredients', title: 'Weekly Beef & Goat Meat Purchase', amount: 480.00, date: new Date().toISOString().split('T')[0], paymentMethod: 'EVC Plus', recordedBy: 'Youssef Ali' },
  { id: 'exp-2', category: 'Utilities', title: 'Generator Diesel & Electricity Bill', amount: 320.00, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], paymentMethod: 'Premier Wallet', recordedBy: 'Khalid Osman' },
  { id: 'exp-3', category: 'Marketing', title: 'Social Media Sponsored Campaign', amount: 150.00, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], paymentMethod: 'Card', recordedBy: 'Ahmed Hassan' }
];

export const initialDailyClosing: DailyClosing = {
  id: 'close-2026-08-04',
  date: '2026-08-04',
  openingCash: 200.00,
  cashSales: 640.00,
  cardSales: 420.00,
  mobileMoneySales: 1250.00,
  totalRevenue: 2310.00,
  actualCashInHand: 840.00,
  difference: 0,
  closedBy: 'Amina Abdi (Cashier)',
  notes: 'All terminal reports matched perfectly.'
};

export const initialLogs: ActivityLog[] = [
  { id: 'log-1', userName: 'Amina Abdi', userRole: 'Cashier', action: 'CREATE_ORDER', module: 'POS', details: 'Created Order #ORD-2026-1001 ($35.32) via EVC Plus', ipAddress: '192.168.1.45', timestamp: new Date(Date.now() - 18 * 60 * 1000).toLocaleString() },
  { id: 'log-2', userName: 'Chef Tariq Ziyad', userRole: 'Kitchen Staff', action: 'UPDATE_KDS', module: 'KDS', details: 'Moved Order #ORD-2026-1003 to READY state', ipAddress: '192.168.1.80', timestamp: new Date(Date.now() - 10 * 60 * 1000).toLocaleString() },
  { id: 'log-3', userName: 'Youssef Ali', userRole: 'Branch Manager', action: 'STOCK_ADJUSTMENT', module: 'Inventory', details: 'Added 50kg Basmati Rice via Stock In', ipAddress: '192.168.1.10', timestamp: new Date(Date.now() - 60 * 60 * 1000).toLocaleString() }
];
