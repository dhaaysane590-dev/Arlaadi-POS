import { 
  MenuItem, 
  MenuCategory, 
  Order, 
  RestaurantTable, 
  Reservation, 
  Ingredient, 
  Employee, 
  Customer, 
  Expense, 
  RestaurantSettings,
  RestaurantTenant,
  ActivityLog
} from '../types';
import { PosDayRecord } from '../components/pos/PosDaysView';
import { FloorRecord } from '../components/tables/FloorsView';
import { 
  initialSettings, 
  initialCategories, 
  initialOrders, 
  initialTables, 
  initialReservations, 
  initialIngredients, 
  initialEmployees, 
  initialCustomers, 
  initialExpenses,
  initialTenants,
  initialLogs
} from '../data/mockData';

import { isSupabaseConfigured, syncAllToSupabase, loadAllFromSupabase } from './supabase';

const DB_KEYS = {
  ORDERS: 'pos_db_orders',
  MENU_ITEMS: 'pos_db_menu_items',
  CATEGORIES: 'pos_db_categories',
  TABLES: 'pos_db_tables',
  RESERVATIONS: 'pos_db_reservations',
  INVENTORY: 'pos_db_inventory',
  EMPLOYEES: 'pos_db_employees',
  POS_DAY_HISTORY: 'pos_db_day_history',
  POS_DAY_STATE: 'pos_db_day_state',
  CLOSED_DATES: 'pos_db_closed_dates',
  FLOORS: 'pos_db_floors',
  CUSTOMERS: 'pos_db_customers',
  EXPENSES: 'pos_db_expenses',
  LOGS: 'pos_db_logs',
  SETTINGS: 'pos_db_settings',
  TENANTS: 'pos_db_tenants',
  ACTIVE_TENANT_ID: 'pos_db_active_tenant_id',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error loading DB key ${key}:`, err);
  }
  return defaultValue;
}

let syncTimeout: any = null;

export function triggerSystemDbSync(): void {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const tenantsList = db.getTenants();
      const restaurantsList = tenantsList.map(t => ({
        ...t,
        contact_info: {
          phone: t.phone || '',
          email: t.email || '',
          address: t.address || ''
        },
        limits: t.limits || {
          maxEmployees: 20,
          maxTables: 30,
          maxOrdersPerDay: 1000,
          maxMenuItems: 150,
          maxBranches: 2
        }
      }));

      const payload = {
        settings: db.getSettings(),
        categories: db.getCategories(),
        menu_items: db.getMenuItems(),
        customers: db.getCustomers(),
        orders: db.getOrders(),
        inventory: db.getInventory(),
        expenses: db.getExpenses(),
        employees: db.getEmployees(),
        tables: db.getTables(),
        restaurants: restaurantsList,
        tenants: restaurantsList,
        reservations: db.getReservations(),
        floors: db.getFloors(),
        pos_day_history: db.getPosDayHistory(),
      };

      // 1. Sync to System Database File (data/system_database.db)
      fetch('/api/db/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      // 2. Sync to Supabase cloud database if configured
      if (isSupabaseConfigured()) {
        syncAllToSupabase(payload).catch((err) => {
          console.warn('[Supabase Sync Error]', err);
        });
      }
    } catch (err) {
      // Ignore offline server
    }
  }, 300);
}

export function triggerMySqlSync(): void {
  triggerSystemDbSync();
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    triggerMySqlSync();
  } catch (err) {
    console.error(`Error saving DB key ${key}:`, err);
  }
}

export const db = {
  // Orders
  getOrders: (): Order[] => getItem<Order[]>(DB_KEYS.ORDERS, []),
  saveOrders: (orders: Order[]) => setItem(DB_KEYS.ORDERS, orders),

  // Menu Items
  getMenuItems: (): MenuItem[] => getItem<MenuItem[]>(DB_KEYS.MENU_ITEMS, []),
  saveMenuItems: (items: MenuItem[]) => setItem(DB_KEYS.MENU_ITEMS, items),

  // Categories
  getCategories: (): MenuCategory[] => getItem<MenuCategory[]>(DB_KEYS.CATEGORIES, []),
  saveCategories: (categories: MenuCategory[]) => setItem(DB_KEYS.CATEGORIES, categories),

  // Tables
  getTables: (): RestaurantTable[] => getItem<RestaurantTable[]>(DB_KEYS.TABLES, []),
  saveTables: (tables: RestaurantTable[]) => setItem(DB_KEYS.TABLES, tables),

  // Reservations
  getReservations: (): Reservation[] => getItem<Reservation[]>(DB_KEYS.RESERVATIONS, []),
  saveReservations: (res: Reservation[]) => setItem(DB_KEYS.RESERVATIONS, res),

  // Inventory / Ingredients
  getInventory: (): Ingredient[] => getItem<Ingredient[]>(DB_KEYS.INVENTORY, []),
  saveInventory: (items: Ingredient[]) => setItem(DB_KEYS.INVENTORY, items),

  // Employees
  getEmployees: (): Employee[] => getItem<Employee[]>(DB_KEYS.EMPLOYEES, []),
  saveEmployees: (emps: Employee[]) => setItem(DB_KEYS.EMPLOYEES, emps),

  // POS Days
  getPosDayHistory: (): PosDayRecord[] => getItem<PosDayRecord[]>(DB_KEYS.POS_DAY_HISTORY, [
    {
      id: 'posday-101',
      sNo: 1,
      date: new Date().toISOString().split('T')[0],
      openingCash: 100,
      totalSales: 340.50,
      startedAt: '08:00 AM',
      startedBy: 'Super Admin',
      status: 'Open'
    }
  ]),
  savePosDayHistory: (history: PosDayRecord[]) => setItem(DB_KEYS.POS_DAY_HISTORY, history),

  getPosDayState: (): PosDayRecord => getItem<PosDayRecord>(DB_KEYS.POS_DAY_STATE, {
    id: 'posday-current',
    sNo: 1,
    date: new Date().toISOString().split('T')[0],
    openingCash: 100,
    totalSales: 340.50,
    startedAt: new Date().toISOString(),
    startedBy: 'Super Admin',
    status: 'Open',
    notes: 'Morning shift operational'
  }),
  savePosDayState: (state: PosDayRecord) => setItem(DB_KEYS.POS_DAY_STATE, state),

  // Closed Dates
  getClosedDates: (): string[] => getItem<string[]>(DB_KEYS.CLOSED_DATES, [
    '17-04-2026',
    '16-04-2026',
    '02-02-2026',
    '21-01-2026'
  ]),
  saveClosedDates: (dates: string[]) => setItem(DB_KEYS.CLOSED_DATES, dates),

  // Floors
  getFloors: (): FloorRecord[] => getItem<FloorRecord[]>(DB_KEYS.FLOORS, [
    { id: 'floor-1', sNo: 1, name: 'Qeybta Hoose', status: 'Active', tableCount: 8 },
    { id: 'floor-2', sNo: 2, name: 'Qeybta Sare', status: 'Active', tableCount: 12 },
    { id: 'floor-3', sNo: 3, name: 'Dabaqa saddexaad', status: 'Active', tableCount: 6 }
  ]),
  saveFloors: (floors: FloorRecord[]) => setItem(DB_KEYS.FLOORS, floors),

  // Customers
  getCustomers: (): Customer[] => getItem<Customer[]>(DB_KEYS.CUSTOMERS, []),
  saveCustomers: (custs: Customer[]) => setItem(DB_KEYS.CUSTOMERS, custs),

  // Expenses
  getExpenses: (): Expense[] => getItem<Expense[]>(DB_KEYS.EXPENSES, []),
  saveExpenses: (expenses: Expense[]) => setItem(DB_KEYS.EXPENSES, expenses),

  // Activity Logs
  getLogs: (): ActivityLog[] => getItem<ActivityLog[]>(DB_KEYS.LOGS, []),
  saveLogs: (logs: ActivityLog[]) => setItem(DB_KEYS.LOGS, logs),

  // Settings
  getSettings: (tenantId?: string): RestaurantSettings => {
    const id = tenantId || db.getActiveTenantId();
    const key = `pos_db_settings_${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.loginAnnouncement && parsed.loginAnnouncement.includes('Palace Bistro')) {
          parsed.loginAnnouncement = '';
        }
        parsed.loginShowProfileSelector = false;
        return parsed;
      } catch (e) {}
    }
    const tenant = db.getTenants().find(t => t.id === id);
    if (tenant) {
      return {
        ...initialSettings,
        name: tenant.name,
        logo: tenant.logo,
        address: tenant.address,
        phone: tenant.phone,
        email: tenant.email,
        currencySymbol: tenant.currencySymbol || '$',
        taxRate: tenant.taxRate ?? 5,
      };
    }
    return getItem<RestaurantSettings>(DB_KEYS.SETTINGS, initialSettings);
  },
  saveSettings: (settings: RestaurantSettings, tenantId?: string) => {
    const id = tenantId || db.getActiveTenantId();
    localStorage.setItem(`pos_db_settings_${id}`, JSON.stringify(settings));
    setItem(DB_KEYS.SETTINGS, settings);
  },

  // Tenants & Multi-Restaurant Control
  getTenants: (): RestaurantTenant[] => getItem<RestaurantTenant[]>(DB_KEYS.TENANTS, initialTenants),
  saveTenants: (tenants: RestaurantTenant[]) => setItem(DB_KEYS.TENANTS, tenants),

  // Direct Server Database File CRUD Operations
  createRestaurantInServerDb: async (tenantData: RestaurantTenant): Promise<boolean> => {
    try {
      const payload = {
        ...tenantData,
        contact_info: {
          phone: tenantData.phone || '',
          email: tenantData.email || '',
          address: tenantData.address || ''
        },
        limits: tenantData.limits || {
          maxEmployees: 20,
          maxTables: 30,
          maxOrdersPerDay: 1000,
          maxMenuItems: 150,
          maxBranches: 2
        }
      };

      const res = await fetch('/api/db/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  updateRestaurantInServerDb: async (id: string, tenantData: Partial<RestaurantTenant>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/db/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  deleteRestaurantInServerDb: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/db/restaurants/${id}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  getActiveTenantId: (): string => getItem<string>(DB_KEYS.ACTIVE_TENANT_ID, 'rest-1'),
  saveActiveTenantId: (id: string) => setItem(DB_KEYS.ACTIVE_TENANT_ID, id),

  // Clear or Reset DB
  resetDB: () => {
    Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  },

  // Load live data from Supabase tables
  loadFromSupabase: async () => {
    if (!isSupabaseConfigured()) return null;
    const data = await loadAllFromSupabase();
    if (!data) return null;

    if (data.categories && data.categories.length > 0) {
      db.saveCategories(data.categories);
    }
    if (data.menuItems && data.menuItems.length > 0) {
      db.saveMenuItems(data.menuItems);
    }
    if (data.tables && data.tables.length > 0) {
      db.saveTables(data.tables);
    }
    if (data.orders && data.orders.length > 0) {
      db.saveOrders(data.orders);
    }
    if (data.customers && data.customers.length > 0) {
      db.saveCustomers(data.customers);
    }
    if (data.inventory && data.inventory.length > 0) {
      db.saveInventory(data.inventory);
    }
    if (data.employees && data.employees.length > 0) {
      db.saveEmployees(data.employees);
    }
    if (data.expenses && data.expenses.length > 0) {
      db.saveExpenses(data.expenses);
    }
    if (data.tenants && data.tenants.length > 0) {
      db.saveTenants(data.tenants);
    }
    if (data.settings) {
      db.saveSettings(data.settings);
    }

    return data;
  }
};
