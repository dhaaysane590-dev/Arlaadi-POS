import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
export const SYSTEM_DB_FILE = path.join(DATA_DIR, 'system_database.db');
export const SYSTEM_DB_JSON_FILE = path.join(DATA_DIR, 'system_database.json');

export interface RestaurantRecord {
  id: string;
  code: string;
  name: string;
  logo: string;
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
  phone?: string;
  email?: string;
  address?: string;
  ownerName: string;
  username: string;
  pin: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Custom';
  status: 'Active' | 'Suspended' | 'Trial' | 'Expired';
  limits: {
    maxEmployees: number;
    maxTables: number;
    maxOrdersPerDay: number;
    maxMenuItems: number;
    maxBranches: number;
  };
  currencySymbol: string;
  taxRate: number;
  features: Record<string, boolean>;
  createdAt: string;
  settings?: any;
}

export interface SystemDatabaseSchema {
  meta: {
    systemName: string;
    version: string;
    lastUpdated: string;
    fileFormat: string;
  };
  restaurants: RestaurantRecord[];
  tenants: any[];
  settings: any;
  orders: any[];
  order_items: any[];
  menu_items: any[];
  categories: any[];
  tables: any[];
  reservations: any[];
  inventory: any[];
  employees: any[];
  customers: any[];
  expenses: any[];
  pos_day_history: any[];
  floors: any[];
  activity_logs: any[];
}

const defaultInitialDatabase: SystemDatabaseSchema = {
  meta: {
    systemName: 'Palace Bistro & Multi-Restaurant POS System',
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    fileFormat: 'SQLite JSON DB Document'
  },
  restaurants: [
    {
      id: 'rest-1',
      code: 'REST-001',
      name: 'Palace Gourmet Bistro & Lounge',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
      contact_info: {
        phone: '+252 61 555 8899',
        email: 'fatima@palacebistro.com',
        address: 'KM4 Square, Maka Al-Mukarama Street, Mogadishu'
      },
      phone: '+252 61 555 8899',
      email: 'fatima@palacebistro.com',
      address: 'KM4 Square, Maka Al-Mukarama Street, Mogadishu',
      ownerName: 'Fatima Omar',
      username: 'palace_bistro',
      pin: '1234',
      plan: 'Enterprise',
      status: 'Active',
      limits: {
        maxEmployees: 50,
        maxTables: 100,
        maxOrdersPerDay: 5000,
        maxMenuItems: 500,
        maxBranches: 10
      },
      currencySymbol: '$',
      taxRate: 5,
      features: {
        pos: true, kds: true, inventory: true, floors: true, customer_site: true,
        reservations: true, delivery: true, accounting: true, reports: true,
        employees: true, pos_days: true, app_settings: true, business_settings: true,
        setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true
      },
      createdAt: '2025-01-15'
    },
    {
      id: 'rest-2',
      code: 'REST-002',
      name: 'Mogadishu Grill & Seafood House',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=160&q=80',
      contact_info: {
        phone: '+252 61 666 1122',
        email: 'hassan@mogadishugrill.com',
        address: 'Lido Beach Road, Mogadishu'
      },
      phone: '+252 61 666 1122',
      email: 'hassan@mogadishugrill.com',
      address: 'Lido Beach Road, Mogadishu',
      ownerName: 'Hassan Ali',
      username: 'mogadishu_grill',
      pin: '2222',
      plan: 'Pro',
      status: 'Active',
      limits: {
        maxEmployees: 25,
        maxTables: 40,
        maxOrdersPerDay: 1500,
        maxMenuItems: 200,
        maxBranches: 3
      },
      currencySymbol: '$',
      taxRate: 10,
      features: {
        pos: true, kds: true, inventory: true, floors: true, customer_site: true,
        reservations: false, delivery: true, accounting: false, reports: true,
        employees: true, pos_days: true, app_settings: true, business_settings: true,
        setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true
      },
      createdAt: '2025-03-10'
    },
    {
      id: 'rest-3',
      code: 'REST-003',
      name: 'Liido Beach Ocean Lounge & Bar',
      logo: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=160&q=80',
      contact_info: {
        phone: '+252 61 777 3344',
        email: 'asha@liidolounge.so',
        address: 'Ocean View Strip, Liido Beach'
      },
      phone: '+252 61 777 3344',
      email: 'asha@liidolounge.so',
      address: 'Ocean View Strip, Liido Beach',
      ownerName: 'Asha Mohamed',
      username: 'liido_lounge',
      pin: '3333',
      plan: 'Starter',
      status: 'Active',
      limits: {
        maxEmployees: 10,
        maxTables: 20,
        maxOrdersPerDay: 500,
        maxMenuItems: 100,
        maxBranches: 1
      },
      currencySymbol: '$',
      taxRate: 0,
      features: {
        pos: true, kds: false, inventory: false, floors: true, customer_site: true,
        reservations: true, delivery: false, accounting: false, reports: false,
        employees: false, pos_days: true, app_settings: true, business_settings: false,
        setups: true, user_management: false, receipts: true, food_menus: true, day_operation: true
      },
      createdAt: '2025-05-01'
    }
  ],
  tenants: [],
  settings: {
    name: 'Palace Gourmet Bistro & Lounge',
    phone: '+252 61 555 8899',
    address: 'KM4 Square, Maka Al-Mukarama Street, Mogadishu',
    currencySymbol: '$',
    taxRate: 5
  },
  orders: [],
  order_items: [],
  menu_items: [],
  categories: [],
  tables: [],
  reservations: [],
  inventory: [],
  employees: [],
  customers: [],
  expenses: [],
  pos_day_history: [],
  floors: [],
  activity_logs: []
};

// Map default initial database tenants list
defaultInitialDatabase.tenants = defaultInitialDatabase.restaurants;

export class SystemDatabaseManager {
  private memoryCache: SystemDatabaseSchema;

  constructor() {
    this.memoryCache = this.loadFromFile();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromFile(): SystemDatabaseSchema {
    try {
      this.ensureDirectory();
      if (fs.existsSync(SYSTEM_DB_FILE)) {
        const fileContent = fs.readFileSync(SYSTEM_DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed && parsed.restaurants) {
          return parsed;
        }
      } else if (fs.existsSync(SYSTEM_DB_JSON_FILE)) {
        const fileContent = fs.readFileSync(SYSTEM_DB_JSON_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (parsed && parsed.restaurants) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('[SystemDB] Error loading database file, re-initializing:', err);
    }

    // Default init & write to disk
    this.memoryCache = { ...defaultInitialDatabase };
    this.persistToDisk();
    return this.memoryCache;
  }

  public persistToDisk(): boolean {
    try {
      this.ensureDirectory();
      this.memoryCache.meta.lastUpdated = new Date().toISOString();
      const content = JSON.stringify(this.memoryCache, null, 2);
      
      // Write both .db and .json file representations
      fs.writeFileSync(SYSTEM_DB_FILE, content, 'utf8');
      fs.writeFileSync(SYSTEM_DB_JSON_FILE, content, 'utf8');
      console.log(`[SystemDB Success] System database persisted cleanly to ${SYSTEM_DB_FILE}`);
      return true;
    } catch (err: any) {
      console.error('[SystemDB Persist Error]', err.message);
      return false;
    }
  }

  public getFullState(): SystemDatabaseSchema {
    return this.memoryCache;
  }

  public updateFullState(newState: Partial<SystemDatabaseSchema>): SystemDatabaseSchema {
    this.memoryCache = {
      ...this.memoryCache,
      ...newState,
      restaurants: newState.restaurants || newState.tenants || this.memoryCache.restaurants,
      tenants: newState.tenants || newState.restaurants || this.memoryCache.tenants,
    };
    this.persistToDisk();
    return this.memoryCache;
  }

  // Restaurant CRUD Operations
  public getRestaurants(): RestaurantRecord[] {
    return this.memoryCache.restaurants || [];
  }

  public getRestaurantById(id: string): RestaurantRecord | undefined {
    return this.getRestaurants().find(r => r.id === id);
  }

  public createRestaurant(data: Partial<RestaurantRecord>): RestaurantRecord {
    const id = data.id || ('rest-' + Date.now());
    const newRest: RestaurantRecord = {
      id,
      code: data.code || ('REST-00' + (this.getRestaurants().length + 1)),
      name: data.name || 'New Restaurant',
      logo: data.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
      contact_info: {
        phone: data.contact_info?.phone || data.phone || '+252 61 000 0000',
        email: data.contact_info?.email || data.email || 'contact@restaurant.com',
        address: data.contact_info?.address || data.address || 'Mogadishu, Somalia'
      },
      phone: data.phone || data.contact_info?.phone || '+252 61 000 0000',
      email: data.email || data.contact_info?.email || 'contact@restaurant.com',
      address: data.address || data.contact_info?.address || 'Mogadishu, Somalia',
      ownerName: data.ownerName || 'Restaurant Owner',
      username: data.username || (data.code || id).toLowerCase().replace('-', '_'),
      pin: data.pin || '1234',
      plan: data.plan || 'Pro',
      status: data.status || 'Active',
      limits: {
        maxEmployees: data.limits?.maxEmployees ?? 20,
        maxTables: data.limits?.maxTables ?? 30,
        maxOrdersPerDay: data.limits?.maxOrdersPerDay ?? 1000,
        maxMenuItems: data.limits?.maxMenuItems ?? 150,
        maxBranches: data.limits?.maxBranches ?? 2
      },
      currencySymbol: data.currencySymbol || '$',
      taxRate: data.taxRate ?? 5,
      features: data.features || {},
      createdAt: data.createdAt || new Date().toISOString().split('T')[0],
      settings: data.settings || {}
    };

    const currentList = this.getRestaurants().filter(r => r.id !== id);
    currentList.push(newRest);
    this.memoryCache.restaurants = currentList;
    this.memoryCache.tenants = currentList;
    this.persistToDisk();
    return newRest;
  }

  public updateRestaurant(id: string, data: Partial<RestaurantRecord>): RestaurantRecord | null {
    const index = this.memoryCache.restaurants.findIndex(r => r.id === id);
    if (index === -1) {
      return this.createRestaurant({ ...data, id });
    }

    const existing = this.memoryCache.restaurants[index];
    const updated: RestaurantRecord = {
      ...existing,
      ...data,
      contact_info: {
        phone: data.contact_info?.phone || data.phone || existing.contact_info?.phone || existing.phone || '',
        email: data.contact_info?.email || data.email || existing.contact_info?.email || existing.email || '',
        address: data.contact_info?.address || data.address || existing.contact_info?.address || existing.address || ''
      },
      limits: {
        maxEmployees: data.limits?.maxEmployees ?? existing.limits?.maxEmployees ?? 20,
        maxTables: data.limits?.maxTables ?? existing.limits?.maxTables ?? 30,
        maxOrdersPerDay: data.limits?.maxOrdersPerDay ?? existing.limits?.maxOrdersPerDay ?? 1000,
        maxMenuItems: data.limits?.maxMenuItems ?? existing.limits?.maxMenuItems ?? 150,
        maxBranches: data.limits?.maxBranches ?? existing.limits?.maxBranches ?? 2
      }
    };

    this.memoryCache.restaurants[index] = updated;
    this.memoryCache.tenants[index] = updated;
    this.persistToDisk();
    return updated;
  }

  public deleteRestaurant(id: string): boolean {
    const initialLen = this.memoryCache.restaurants.length;
    this.memoryCache.restaurants = this.memoryCache.restaurants.filter(r => r.id !== id);
    this.memoryCache.tenants = this.memoryCache.tenants.filter((t: any) => t.id !== id);
    const deleted = this.memoryCache.restaurants.length < initialLen;
    if (deleted) {
      this.persistToDisk();
    }
    return deleted;
  }

  // Universal Collection CRUD Operations
  public getCollection(collectionName: keyof SystemDatabaseSchema): any[] {
    const val = (this.memoryCache as any)[collectionName];
    if (Array.isArray(val)) return val;
    return [];
  }

  public updateCollectionItem(collectionName: keyof SystemDatabaseSchema, id: string, item: any): any {
    let arr = this.getCollection(collectionName);
    const index = arr.findIndex((x: any) => x.id === id);
    if (index > -1) {
      arr[index] = { ...arr[index], ...item, id };
    } else {
      arr.push({ ...item, id });
    }
    (this.memoryCache as any)[collectionName] = arr;
    this.persistToDisk();
    return item;
  }

  public deleteCollectionItem(collectionName: keyof SystemDatabaseSchema, id: string): boolean {
    let arr = this.getCollection(collectionName);
    const newArr = arr.filter((x: any) => x.id !== id);
    (this.memoryCache as any)[collectionName] = newArr;
    this.persistToDisk();
    return newArr.length < arr.length;
  }
}

export const systemDb = new SystemDatabaseManager();
