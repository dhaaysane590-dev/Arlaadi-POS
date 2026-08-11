import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from './utils/db';
import {
  User,
  UserRole,
  Order,
  OrderStatus,
  MenuItem,
  MenuCategory,
  RestaurantTable,
  Ingredient,
  Customer,
  Reservation,
  DeliveryDriver,
  Employee,
  Expense,
  DailyClosing,
  ActivityLog,
  RestaurantSettings,
  PaymentMethod,
  RestaurantTenant
} from './types';
import {
  initialSettings,
  currentUserProfiles,
  initialCategories,
  initialIngredients,
  initialMenuItems,
  initialTables,
  initialOrders,
  initialSuppliers,
  initialCustomers,
  initialReservations,
  initialDrivers,
  initialEmployees,
  initialExpenses,
  initialDailyClosing,
  initialLogs,
  initialTenants
} from './data/mockData';

// Layout & Modules
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { PosView } from './components/pos/PosView';
import { KitchenView } from './components/kitchen/KitchenView';
import { TableManagementView } from './components/tables/TableManagementView';
import { MenuManagementView } from './components/menu/MenuManagementView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { InventoryView } from './components/inventory/InventoryView';
import { CustomerView } from './components/customers/CustomerView';
import { ReservationView } from './components/reservations/ReservationView';
import { DeliveryView } from './components/delivery/DeliveryView';
import { EmployeeView } from './components/employees/EmployeeView';
import { AccountingView } from './components/accounting/AccountingView';
import { ReportView } from './components/reports/ReportView';
import { SettingsView } from './components/settings/SettingsView';
import { PosDaysView, PosDayRecord } from './components/pos/PosDaysView';
import { ClosedDatesView } from './components/pos/ClosedDatesView';
import { FloorsView } from './components/tables/FloorsView';
import { CustomerSiteView } from './components/customer/CustomerSiteView';
import { SuperAdminView } from './components/superadmin/SuperAdminView';
import { LoginView } from './components/auth/LoginView';

export default function App() {
  // Theme & Auth / User Role State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(currentUserProfiles[0]); // Default Super Admin
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Sidebar Layout State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Automatically collapse sidebar when navigating to POS screen
  useEffect(() => {
    if (activeTab === 'pos') {
      setIsSidebarCollapsed(true);
      setIsMobileSidebarOpen(false);
    }
  }, [activeTab]);

  // Multi-Tenant State
  const [tenants, setTenants] = useState<RestaurantTenant[]>(() => db.getTenants());
  const [activeTenantId, setActiveTenantId] = useState<string>(() => db.getActiveTenantId());

  // Current active tenant context
  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // Authorization check for active tab / feature module
  const isFeatureAllowed = (tab: ActiveTab): boolean => {
    // 1. Super Admin module is strictly for Super Admin role
    if (tab === 'super_admin') {
      return currentUser.role === 'Super Admin';
    }

    // 2. Super Admin role has access to all features
    if (currentUser.role === 'Super Admin') {
      return true;
    }

    // 3. Role-based module restrictions
    if (tab === 'settings' || tab === 'employees') {
      if (currentUser.role === 'Cashier' || currentUser.role === 'Waiter' || currentUser.role === 'Kitchen Staff' || currentUser.role === 'Delivery Driver' || currentUser.role === 'Inventory Manager' || currentUser.role === 'Accountant') {
        return false;
      }
    }

    if (tab === 'accounting' || tab === 'reports') {
      if (currentUser.role === 'Waiter' || currentUser.role === 'Kitchen Staff' || currentUser.role === 'Delivery Driver' || currentUser.role === 'Cashier') {
        return false;
      }
    }

    if (tab === 'kds') {
      if (currentUser.role === 'Delivery Driver' || currentUser.role === 'Accountant') {
        return false;
      }
    }

    if (tab === 'inventory') {
      if (currentUser.role === 'Waiter' || currentUser.role === 'Delivery Driver') {
        return false;
      }
    }

    // 4. Restaurant Tenant-level feature toggles
    const tabFeatureMap: Record<string, string> = {
      pos: 'pos',
      kds: 'kds',
      tables: 'floors',
      floors: 'floors',
      inventory: 'inventory',
      reservations: 'reservations',
      delivery: 'delivery',
      employees: 'employees',
      accounting: 'accounting',
      reports: 'reports',
      pos_days: 'pos_days',
      customer_site: 'customer_site',
      menu: 'food_menus',
      orders: 'receipts',
      settings: 'app_settings',
      closed_dates: 'day_operation',
      customers: 'setups'
    };

    const featKey = tabFeatureMap[tab];

    if (featKey && activeTenant && activeTenant.features) {
      if ((activeTenant.features as any)[featKey] === false) {
        return false;
      }
    }

    if (featKey && activeTenant && activeTenant.rolePermissions && activeTenant.rolePermissions[currentUser.role]) {
      const rolePerms = activeTenant.rolePermissions[currentUser.role];
      if (rolePerms && (rolePerms as any)[featKey] === false) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => { db.saveTenants(tenants); }, [tenants]);
  useEffect(() => {
    db.saveActiveTenantId(activeTenantId);
    setSettings(db.getSettings(activeTenantId));
  }, [activeTenantId]);

  // Sync active tenant name with settings when active tenant changes
  useEffect(() => {
    if (activeTenant && activeTenant.name && settings.name !== activeTenant.name) {
      setSettings(prev => ({ ...prev, name: activeTenant.name }));
    }
  }, [activeTenantId]);

  const handleUpdateSettings = (newSettings: RestaurantSettings) => {
    setSettings(newSettings);
    db.saveSettings(newSettings, activeTenantId);
    if (activeTenant && newSettings.name && newSettings.name !== activeTenant.name) {
      setTenants(prev => prev.map(t => t.id === activeTenantId ? { ...t, name: newSettings.name } : t));
    }
    addAuditLog('Updated Settings', 'Settings', 'Updated system configuration and restaurant settings');
  };

  // Application Domain State loaded from DB
  const [settings, setSettings] = useState<RestaurantSettings>(() => db.getSettings(activeTenantId));
  const [categories, setCategories] = useState<MenuCategory[]>(() => db.getCategories());
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => db.getInventory() as any);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => db.getMenuItems());
  const [tables, setTables] = useState<RestaurantTable[]>(() => db.getTables());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [heldOrders, setHeldOrders] = useState<Order[]>([]);
  const [loadedOrderForPOS, setLoadedOrderForPOS] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers());
  const [reservations, setReservations] = useState<Reservation[]>(() => db.getReservations());
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(initialDrivers);
  const [employees, setEmployees] = useState<Employee[]>(() => db.getEmployees());
  const [expenses, setExpenses] = useState<Expense[]>(() => db.getExpenses());
  const [dailyClosing, setDailyClosing] = useState<DailyClosing>(initialDailyClosing);
  const [logs, setLogs] = useState<ActivityLog[]>(() => db.getLogs());

  // POS Day State & History
  const [posDayState, setPosDayState] = useState<{
    isOpen: boolean;
    date: string;
    openingCash: number;
    startedAt: string;
    startedAtIso?: string;
    startedBy: string;
    notes?: string;
  }>(() => {
    const savedState = db.getPosDayState();
    return {
      isOpen: savedState.status === 'Open',
      date: savedState.date || new Date().toISOString().split('T')[0],
      openingCash: savedState.openingCash ?? 100,
      startedAt: savedState.startedAt || '08:00 AM',
      startedAtIso: (savedState as any).startedAtIso,
      startedBy: savedState.startedBy || 'Super Admin',
      notes: savedState.notes
    };
  });

  const [posDayHistory, setPosDayHistory] = useState<PosDayRecord[]>(() => {
    const saved = db.getPosDayHistory();
    if (saved && saved.length > 0) return saved as PosDayRecord[];
    return [
      {
        id: 'posday-101',
        tenantId: 'rest-1',
        sNo: 1,
        date: new Date().toISOString().split('T')[0],
        openingCash: 100,
        totalSales: 340.50,
        startedAt: '08:00 AM',
        startedBy: 'Super Admin',
        status: 'Open'
      }
    ];
  });

  // DB Sync Effects - Auto Persist on any state change across the system
  useEffect(() => { db.saveOrders(orders); }, [orders]);
  useEffect(() => { db.saveMenuItems(menuItems); }, [menuItems]);
  useEffect(() => { db.saveCategories(categories); }, [categories]);
  useEffect(() => { db.saveTables(tables); }, [tables]);
  useEffect(() => { db.saveReservations(reservations); }, [reservations]);
  useEffect(() => { db.saveInventory(ingredients as any); }, [ingredients]);
  useEffect(() => { db.saveEmployees(employees); }, [employees]);
  useEffect(() => { db.saveCustomers(customers); }, [customers]);
  useEffect(() => { db.saveExpenses(expenses); }, [expenses]);
  useEffect(() => { db.saveLogs(logs); }, [logs]);
  useEffect(() => { db.saveSettings(settings, activeTenantId); }, [settings, activeTenantId]);
  useEffect(() => { db.savePosDayHistory(posDayHistory); }, [posDayHistory]);
  useEffect(() => {
    db.savePosDayState({
      id: 'posday-current',
      tenantId: activeTenantId,
      sNo: posDayHistory.length + 1,
      date: posDayState.date,
      openingCash: posDayState.openingCash,
      totalSales: 0,
      startedAt: posDayState.startedAt,
      startedBy: posDayState.startedBy,
      status: posDayState.isOpen ? 'Open' : 'Closed',
      notes: posDayState.notes
    });
  }, [posDayState, posDayHistory, activeTenantId]);

  // Tenant-Scoped Data Filtering Helper: Ensures every restaurant sees ONLY its own activity and records
  const isForActiveTenant = useCallback((item: { tenantId?: string; branchId?: string }) => {
    const itemTenant = item.tenantId || item.branchId;
    if (itemTenant) {
      return itemTenant === activeTenantId;
    }
    return activeTenantId === 'rest-1';
  }, [activeTenantId]);

  const tenantOrders = useMemo(() => orders.filter(isForActiveTenant), [orders, isForActiveTenant]);
  const tenantMenuItems = useMemo(() => menuItems.filter(isForActiveTenant), [menuItems, isForActiveTenant]);
  const tenantCategories = useMemo(() => categories.filter(isForActiveTenant), [categories, isForActiveTenant]);
  const tenantTables = useMemo(() => tables.filter(isForActiveTenant), [tables, isForActiveTenant]);
  const tenantIngredients = useMemo(() => ingredients.filter(isForActiveTenant), [ingredients, isForActiveTenant]);
  const tenantExpenses = useMemo(() => expenses.filter(isForActiveTenant), [expenses, isForActiveTenant]);
  const tenantLogs = useMemo(() => logs.filter(isForActiveTenant), [logs, isForActiveTenant]);
  const tenantReservations = useMemo(() => reservations.filter(isForActiveTenant), [reservations, isForActiveTenant]);
  const tenantCustomers = useMemo(() => customers.filter(isForActiveTenant), [customers, isForActiveTenant]);
  const tenantEmployees = useMemo(() => employees.filter(isForActiveTenant), [employees, isForActiveTenant]);
  const tenantPosDayHistory = useMemo(() => posDayHistory.filter(isForActiveTenant), [posDayHistory, isForActiveTenant]);
  const tenantHeldOrders = useMemo(() => heldOrders.filter(isForActiveTenant), [heldOrders, isForActiveTenant]);

  // Active Indicators
  const activeOrdersCount = tenantOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const lowStockCount = tenantIngredients.filter(i => i.stockQuantity <= i.minThreshold).length;
  const kdsPendingCount = tenantOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  // Audit Log Helper
  const addAuditLog = (action: string, module: string, details: string, targetTenantId?: string) => {
    const newLog: ActivityLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      tenantId: targetTenantId || activeTenantId,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      ipAddress: '192.168.1.10',
      timestamp: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Order Handlers
  const handleCompletePOSOrder = (newOrder: Order) => {
    const orderWithTenant: Order = {
      ...newOrder,
      tenantId: newOrder.tenantId || activeTenantId
    };
    setOrders(prev => {
      const exists = prev.some(o => o.id === orderWithTenant.id);
      if (exists) {
        return prev.map(o => o.id === orderWithTenant.id ? orderWithTenant : o);
      }
      return [orderWithTenant, ...prev];
    });

    // Update Table Status if Dine In
    if (orderWithTenant.tableId) {
      setTables(prev => prev.map(t => {
        if (t.id === orderWithTenant.tableId) {
          return { ...t, status: 'Occupied', currentOrderId: orderWithTenant.id };
        }
        return t;
      }));
    }

    // Automatic Recipe Ingredient Inventory Stock Deduction
    if (settings.enableAutoIngredientDeduction) {
      setIngredients(prevIngs => {
        const updated = [...prevIngs];
        orderWithTenant.items.forEach(orderItem => {
          const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
          if (menuItem && menuItem.recipe) {
            menuItem.recipe.forEach(recipeIng => {
              const ingIndex = updated.findIndex(i => i.id === recipeIng.ingredientId);
              if (ingIndex !== -1) {
                const totalDeduct = recipeIng.quantityRequired * orderItem.quantity;
                updated[ingIndex] = {
                  ...updated[ingIndex],
                  stockQuantity: Math.max(0, updated[ingIndex].stockQuantity - totalDeduct)
                };
              }
            });
          }
        });
        return updated;
      });
    }

    addAuditLog('CREATE_ORDER', 'POS', `Completed ${orderWithTenant.orderType} Order ${orderWithTenant.orderNumber} ($${orderWithTenant.totalAmount.toFixed(2)}) via ${orderWithTenant.paymentMethod}`);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    addAuditLog('EDIT_ORDER', 'Orders', `Updated Order ${updatedOrder.orderNumber}`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return o;
    }));

    addAuditLog('UPDATE_ORDER_STATUS', 'Orders', `Updated Order #${orderId} to ${newStatus}`);
  };

  const handleRefundOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, paymentStatus: 'Refunded', status: 'Cancelled' };
      }
      return o;
    }));

    addAuditLog('REFUND_ORDER', 'Orders', `Refunded Order #${orderId}`);
  };

  // Held Orders Queue
  const handleHoldOrder = (cartOrder: Partial<Order>) => {
    const held: Order = {
      id: 'held-' + Date.now(),
      tenantId: activeTenantId,
      orderNumber: cartOrder.orderNumber || '#HOLD-' + Math.floor(1000 + Math.random() * 9000),
      orderType: cartOrder.orderType || 'Dine In',
      customerName: cartOrder.customerName || 'Walk-in Guest',
      items: cartOrder.items || [],
      subtotal: cartOrder.subtotal || 0,
      taxAmount: cartOrder.taxAmount || 0,
      discountAmount: cartOrder.discountAmount || 0,
      serviceCharge: cartOrder.serviceCharge || 0,
      tipAmount: cartOrder.tipAmount || 0,
      totalAmount: cartOrder.totalAmount || 0,
      paidAmount: 0,
      changeAmount: 0,
      paymentStatus: 'Unpaid',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isHeld: true
    };

    setHeldOrders(prev => [held, ...prev]);
    addAuditLog('HOLD_ORDER', 'POS', `Held Order ${held.orderNumber}`);
  };

  const handleResumeHeldOrder = (heldOrder: Order) => {
    setHeldOrders(prev => prev.filter(o => o.id !== heldOrder.id));
  };

  const handleDeleteHeldOrder = (heldOrderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== heldOrderId));
  };

  // Inventory Restock
  const handleRestockIngredient = (ingredientId: string, addedQty: number) => {
    setIngredients(prev => prev.map(i => {
      if (i.id === ingredientId) {
        return {
          ...i,
          stockQuantity: i.stockQuantity + addedQty,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return i;
    }));

    addAuditLog('RESTOCK_INVENTORY', 'Inventory', `Restocked ${addedQty} units of ingredient #${ingredientId}`);
  };

  // Customer Loyalty Wallet Top Up
  const handleTopUpWallet = (customerId: string, amount: number) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, walletBalance: c.walletBalance + amount };
      }
      return c;
    }));

    addAuditLog('WALLET_TOPUP', 'Customers', `Topped up $${amount} to Customer #${customerId}`);
  };

  // Table Management
  const handleSelectTableForPOS = (table: RestaurantTable) => {
    setActiveTab('pos');
  };

  const handleUpdateTableStatus = (tableId: string, status: RestaurantTable['status']) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, status };
      }
      return t;
    }));
  };

  const handleMergeTables = (sourceTableId: string, targetTableId: string) => {
    const sourceTable = tables.find(t => t.id === sourceTableId);
    if (!sourceTable) return;

    setTables(prev => prev.map(t => {
      if (t.id === targetTableId) {
        return {
          ...t,
          mergedWith: [...(t.mergedWith || []), sourceTable.tableNumber]
        };
      }
      if (t.id === sourceTableId) {
        return { ...t, status: 'Occupied' };
      }
      return t;
    }));
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    addAuditLog('DELETE_ORDER', 'Orders', `Deleted order ID: ${orderId}`);
  };

  const handleAddEmployee = (emp: Employee) => {
    const empWithTenant = { ...emp, tenantId: activeTenantId, branchId: activeTenantId };
    setEmployees(prev => [empWithTenant, ...prev]);
    addAuditLog('ADD_EMPLOYEE', 'Employees', `Added employee ${emp.name} (${emp.code})`);
  };

  const handleUpdateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    addAuditLog('UPDATE_EMPLOYEE', 'Employees', `Updated employee ${emp.name}`);
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== empId));
    addAuditLog('DELETE_EMPLOYEE', 'Employees', `Deleted employee ID: ${empId}`);
  };

  const handleStartPosDay = (date: string, openingCash: number, notes?: string) => {
    const nowIso = new Date().toISOString();
    const newRecord: PosDayRecord = {
      id: 'posday-' + Date.now(),
      tenantId: activeTenantId,
      sNo: posDayHistory.length + 1,
      date,
      openingCash,
      totalSales: 0,
      startedAt: new Date().toLocaleTimeString(),
      startedBy: currentUser.name,
      status: 'Open',
      notes
    };

    setPosDayState({
      isOpen: true,
      date,
      openingCash,
      startedAt: new Date().toLocaleTimeString(),
      startedAtIso: nowIso,
      startedBy: currentUser.name,
      notes
    });

    setPosDayHistory(prev => [newRecord, ...prev.map(r => ({ ...r, status: 'Closed' as const }))]);
    addAuditLog('START_POS_DAY', 'POS Days', `Started POS Day for ${date} with opening cash float $${openingCash}`);
  };

  const handleClosePosDay = (closingCash: number) => {
    setPosDayState(prev => ({
      ...prev,
      isOpen: false
    }));

    setPosDayHistory(prev => prev.map(r => {
      if (r.status === 'Open') {
        return {
          ...r,
          closingCash,
          closedAt: new Date().toLocaleTimeString(),
          closedBy: currentUser.name,
          status: 'Closed' as const
        };
      }
      return r;
    }));

    addAuditLog('CLOSE_POS_DAY', 'POS Days', `Closed POS Day for ${posDayState.date} with register cash $${closingCash}`);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Today's Sales and Today's Orders for POS Reception (Tenant Scoped)
  const todayPaidOrders = tenantOrders.filter(o => {
    if (o.status === 'Cancelled') return false;
    if (!posDayState.isOpen) return false;
    if (posDayState.startedAtIso) {
      if (!o.createdAt || o.createdAt < posDayState.startedAtIso) return false;
    } else {
      const isToday = !o.createdAt || o.createdAt.startsWith(todayStr);
      if (!isToday) return false;
    }
    const isPaid = o.paymentStatus === 'Paid' || (o.paidAmount && o.paidAmount > 0);
    return isPaid;
  });

  const totalSalesToday = todayPaidOrders.reduce((sum, o) => {
    if (o.paymentStatus === 'Paid') return sum + (o.totalAmount || 0);
    return sum + (o.paidAmount || 0);
  }, 0);

  const todayOrdersList = tenantOrders.filter(o => {
    if (o.status === 'Cancelled') return false;
    if (!posDayState.isOpen) return false;
    if (posDayState.startedAtIso) {
      if (!o.createdAt || o.createdAt < posDayState.startedAtIso) return false;
    } else {
      return !o.createdAt || o.createdAt.startsWith(todayStr);
    }
    return true;
  });

  const todayOrdersCount = todayOrdersList.length;

  if (!isLoggedIn) {
    return (
      <LoginView
        settings={settings}
        users={currentUserProfiles}
        activeTenant={activeTenant}
        tenants={tenants}
        onSelectTenant={(tenantId) => {
          setActiveTenantId(tenantId);
          db.saveActiveTenantId(tenantId);
        }}
        onLogin={(user) => {
          if (user.role !== 'Super Admin') {
            const tenantIdToUse = (user as any).tenantId || user.branchId || activeTenantId;
            const targetTenant = tenants.find(t => t.id === tenantIdToUse);
            if (targetTenant && targetTenant.status === 'Suspended') {
              alert('Fadlam la xiriir Arlaadi ICT Solutions');
              return;
            }
          }

          setCurrentUser(user);
          setIsLoggedIn(true);

          const tenantIdToUse = (user as any).tenantId || user.branchId;
          if (tenantIdToUse) {
            setActiveTenantId(tenantIdToUse);
            db.saveActiveTenantId(tenantIdToUse);
          }

          // Route to appropriate active tab for role
          if (user.role === 'Super Admin') {
            setActiveTab('dashboard');
          } else if (user.role === 'Kitchen Staff') {
            setActiveTab('kds');
          } else if (user.role === 'Cashier' || user.role === 'Waiter') {
            setActiveTab('pos');
          } else if (user.role === 'Delivery Driver') {
            setActiveTab('delivery');
          } else if (user.role === 'Inventory Manager') {
            setActiveTab('inventory');
          } else if (user.role === 'Accountant') {
            setActiveTab('accounting');
          } else {
            setActiveTab('dashboard');
          }

          addAuditLog('USER_LOGIN', 'Auth', `${user.name} (${user.role}) logged in successfully`, tenantIdToUse || activeTenantId);
        }}
      />
    );
  }

  return (
    <div className={`app-wrapper min-vh-100 font-sans ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      
      {/* Top Navbar Header with Role Switcher & Last Orders */}
      <Navbar
        settings={settings}
        currentUser={currentUser}
        allUsers={currentUserProfiles}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          addAuditLog('SWITCH_USER_ROLE', 'Auth', `Switched active perspective to ${user.role}`);
        }}
        onLogout={() => {
          setIsLoggedIn(false);
          addAuditLog('USER_LOGOUT', 'Auth', `${currentUser.name} logged out`);
        }}
        tenants={tenants}
        activeTenantId={activeTenantId}
        onSelectTenant={(id) => {
          setActiveTenantId(id);
          const t = tenants.find(tenant => tenant.id === id);
          if (t) {
            addAuditLog('SWITCH_TENANT_CONTEXT', 'SuperAdmin', `Switched active restaurant context to ${t.name} (${t.code})`);
          }
        }}
        orders={tenantOrders}
        onUpdateOrder={handleUpdateOrder}
        onSelectOrderToCart={(order) => {
          setLoadedOrderForPOS(order);
          setActiveTab('pos');
        }}
        onQuickNewOrder={() => {
          setLoadedOrderForPOS(null);
          setActiveTab('pos');
        }}
        onOpenCustomerSite={() => setActiveTab('customer_site')}
        onNavigateToDashboard={() => setActiveTab('dashboard')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="d-flex position-relative">
        
        {/* Module Operations Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userRole={currentUser.role}
          currentUser={currentUser}
          activeTenant={activeTenant}
          isDarkMode={isDarkMode}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content View Container */}
        <main className="flex-grow-1 overflow-x-hidden" style={{ minWidth: 0 }}>
          {!isFeatureAllowed(activeTab) ? (
            <div className="p-4 p-md-5 text-center my-4">
              <div className={`card shadow-sm border-0 mx-auto p-4 p-md-5 rounded-4 ${isDarkMode ? 'bg-dark border border-secondary text-white' : 'bg-white text-dark'}`} style={{ maxWidth: '520px' }}>
                <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="fa-solid fa-lock fa-2xl"></i>
                </div>
                <h3 className="h5 fw-bold mb-2">Access Restricted</h3>
                <p className="text-muted small mb-4">
                  The feature <strong>{activeTab.toUpperCase()}</strong> is currently disabled for <strong>{activeTenant?.name || 'this restaurant'}</strong> or your role (<strong>{currentUser.role}</strong>). Please contact the Super Admin to enable this module.
                </p>
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="btn btn-primary fw-bold rounded-3 py-2 px-4 shadow-sm mx-auto d-inline-flex align-items-center gap-2"
                >
                  <i className="fa-solid fa-gauge-high"></i>
                  <span>Return to Dashboard</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'super_admin' && (
                <SuperAdminView
                  tenants={tenants}
                  activeTenantId={activeTenantId}
                  onUpdateTenants={setTenants}
                  onSelectActiveTenant={setActiveTenantId}
                  isDarkMode={isDarkMode}
                />
              )}

          {activeTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              orders={tenantOrders}
              tables={tenantTables}
              ingredients={tenantIngredients}
              expenses={tenantExpenses}
              logs={tenantLogs}
              settings={settings}
              reservations={tenantReservations}
              onNavigate={(tab) => setActiveTab(tab)}
              isDarkMode={isDarkMode}
              posDayState={posDayState}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              categories={tenantCategories}
              menuItems={tenantMenuItems}
              tables={tenantTables}
              customers={tenantCustomers}
              employees={tenantEmployees}
              settings={settings}
              heldOrders={tenantHeldOrders}
              onHoldOrder={handleHoldOrder}
              onResumeHeldOrder={handleResumeHeldOrder}
              onDeleteHeldOrder={handleDeleteHeldOrder}
              onCompleteOrder={handleCompletePOSOrder}
              loadedOrder={loadedOrderForPOS}
              onClearLoadedOrder={() => setLoadedOrderForPOS(null)}
              isDarkMode={isDarkMode}
              posDayState={posDayState}
              totalSalesToday={totalSalesToday}
              todayOrdersCount={todayOrdersCount}
              onNavigateToPosDays={() => setActiveTab('pos_days')}
              onNavigateToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'customer_site' && (
            <CustomerSiteView
              menuItems={tenantMenuItems}
              categories={tenantCategories}
              tables={tenantTables}
              orders={tenantOrders}
              onAddOrder={handleCompletePOSOrder}
              onAddReservation={(newRes) => setReservations(prev => [{ ...newRes, tenantId: activeTenantId }, ...prev])}
              settings={settings}
              isDarkMode={isDarkMode}
              onSwitchToStaff={() => setActiveTab('pos')}
            />
          )}

          {activeTab === 'pos_days' && (
            <PosDaysView
              posDayState={posDayState}
              posDayHistory={tenantPosDayHistory}
              onStartDay={handleStartPosDay}
              onCloseDay={handleClosePosDay}
              isDarkMode={isDarkMode}
              totalSalesToday={totalSalesToday}
            />
          )}

          {activeTab === 'closed_dates' && (
            <ClosedDatesView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'floors' && (
            <FloorsView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'kds' && (
            <KitchenView
              orders={tenantOrders}
              menuItems={tenantMenuItems}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              enableSoundAlerts={settings.enableKdsSoundAlerts}
              isDarkMode={isDarkMode}
              settings={settings}
            />
          )}

          {activeTab === 'tables' && (
            <TableManagementView
              tables={tenantTables}
              orders={tenantOrders}
              onSelectTableForPOS={handleSelectTableForPOS}
              onUpdateTableStatus={handleUpdateTableStatus}
              onMergeTables={handleMergeTables}
              onAddTable={(newTable) => setTables(prev => [{ ...newTable, tenantId: activeTenantId }, ...prev])}
              onUpdateTable={(updatedTable) => setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t))}
              onDeleteTable={(tableId) => setTables(prev => prev.filter(t => t.id !== tableId))}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'orders' && (
            <OrderManagementView
              orders={tenantOrders}
              employees={tenantEmployees}
              settings={settings}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRefundOrder={handleRefundOrder}
              onDeleteOrder={handleDeleteOrder}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagementView
              categories={tenantCategories}
              menuItems={tenantMenuItems}
              ingredients={tenantIngredients}
              onAddMenuItem={(item) => setMenuItems(prev => [{ ...item, tenantId: activeTenantId }, ...prev])}
              onUpdateMenuItem={(item) => setMenuItems(prev => prev.map(m => m.id === item.id ? item : m))}
              onDeleteMenuItem={(id) => setMenuItems(prev => prev.filter(m => m.id !== id))}
              onAddCategory={(cat) => setCategories(prev => [{ ...cat, tenantId: activeTenantId }, ...prev])}
              onUpdateCategory={(cat) => setCategories(prev => prev.map(c => c.id === cat.id ? cat : c))}
              onDeleteCategory={(catId) => setCategories(prev => prev.filter(c => c.id !== catId))}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              ingredients={tenantIngredients}
              suppliers={initialSuppliers}
              onRestockIngredient={handleRestockIngredient}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerView
              customers={tenantCustomers}
              onTopUpWallet={handleTopUpWallet}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationView
              reservations={tenantReservations}
              tables={tenantTables}
              onAddReservation={(res) => setReservations(prev => [{ ...res, tenantId: activeTenantId }, ...prev])}
              onUpdateReservationStatus={(id, stat) => setReservations(prev => prev.map(r => r.id === id ? { ...r, status: stat } : r))}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'delivery' && (
            <DeliveryView
              drivers={drivers}
              deliveryOrders={tenantOrders.filter(o => o.orderType === 'Delivery')}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeView
              employees={tenantEmployees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'accounting' && (
            <AccountingView
              expenses={tenantExpenses}
              dailyClosing={dailyClosing}
              settings={settings}
              onAddExpense={(exp) => setExpenses(prev => [{ ...exp, tenantId: activeTenantId }, ...prev])}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'reports' && (
            <ReportView
              orders={tenantOrders}
              menuItems={tenantMenuItems}
              expenses={tenantExpenses}
              settings={settings}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isDarkMode={isDarkMode}
              activeTenant={activeTenant}
              tenants={tenants}
              onUpdateTenants={setTenants}
              allAppData={{
                settings,
                categories,
                ingredients,
                menuItems,
                tables,
                orders,
                heldOrders,
                customers,
                reservations,
                drivers,
                employees,
                expenses,
                dailyClosing,
                logs,
                posDayState
              }}
              onRestoreAppData={(imported) => {
                if (imported.settings) setSettings(imported.settings);
                if (imported.categories && Array.isArray(imported.categories)) setCategories(imported.categories);
                if (imported.ingredients && Array.isArray(imported.ingredients)) setIngredients(imported.ingredients);
                if (imported.menuItems && Array.isArray(imported.menuItems)) setMenuItems(imported.menuItems);
                if (imported.tables && Array.isArray(imported.tables)) setTables(imported.tables);
                if (imported.orders && Array.isArray(imported.orders)) setOrders(imported.orders);
                if (imported.heldOrders && Array.isArray(imported.heldOrders)) setHeldOrders(imported.heldOrders);
                if (imported.customers && Array.isArray(imported.customers)) setCustomers(imported.customers);
                if (imported.reservations && Array.isArray(imported.reservations)) setReservations(imported.reservations);
                if (imported.drivers && Array.isArray(imported.drivers)) setDrivers(imported.drivers);
                if (imported.employees && Array.isArray(imported.employees)) setEmployees(imported.employees);
                if (imported.expenses && Array.isArray(imported.expenses)) setExpenses(imported.expenses);
                if (imported.dailyClosing) setDailyClosing(imported.dailyClosing);
                if (imported.logs && Array.isArray(imported.logs)) setLogs(imported.logs);
                if (imported.posDayState) setPosDayState(imported.posDayState);
              }}
            />
          )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
