import React, { useState } from 'react';
import { UserRole, RestaurantTenant, RestaurantFeatureKey, User } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Lock,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'customer_site'
  | 'pos_days'
  | 'closed_dates'
  | 'floors'
  | 'kds'
  | 'tables'
  | 'orders'
  | 'menu'
  | 'inventory'
  | 'customers'
  | 'reservations'
  | 'delivery'
  | 'employees'
  | 'accounting'
  | 'reports'
  | 'settings'
  | 'super_admin';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  activeTenant?: RestaurantTenant;
  currentUser?: User;
  isDarkMode: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface SubMenuItem {
  id: string;
  label: string;
  targetTab: ActiveTab;
  requiredFeature?: RestaurantFeatureKey;
}

interface DropdownMenuItem {
  id: string;
  label: string;
  iconClass: string;
  targetTab?: ActiveTab;
  requiredFeature?: RestaurantFeatureKey;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  activeTenant,
  currentUser,
  isDarkMode,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Track open dropdown sections by id
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    day_ops: true,
    floor_mgmt: false,
    hotel_menus: false,
    reports: false,
    user_mgmt: false,
    employees: false,
    app_settings: false,
    business_settings: false,
    setups: false
  });

  const [activeSubItem, setActiveSubItem] = useState<string>('pos');

  const toggleDropdown = (id: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isFeatureAllowed = (feat?: RestaurantFeatureKey, targetTab?: ActiveTab) => {
    // 1. Super Admin role bypasses module restrictions
    if (userRole === 'Super Admin') return true;

    // 2. Super Admin Portal tab is strictly reserved for Super Admin role
    if (targetTab === 'super_admin') return false;

    // 3. Administrative settings & management modules restricted for non-admin operational staff
    if (targetTab === 'settings' || targetTab === 'employees') {
      if (userRole === 'Cashier' || userRole === 'Waiter' || userRole === 'Kitchen Staff' || userRole === 'Delivery Driver' || userRole === 'Inventory Manager' || userRole === 'Accountant') {
        return false;
      }
    }

    // 4. Reports & Accounting restricted for non-finance operational staff
    if (targetTab === 'accounting' || targetTab === 'reports') {
      if (userRole === 'Waiter' || userRole === 'Kitchen Staff' || userRole === 'Delivery Driver' || userRole === 'Cashier') {
        return false;
      }
    }

    if (targetTab === 'kds') {
      if (userRole === 'Delivery Driver' || userRole === 'Accountant') {
        return false;
      }
    }

    if (targetTab === 'inventory') {
      if (userRole === 'Waiter' || userRole === 'Delivery Driver') {
        return false;
      }
    }

    // 5. Tenant level feature toggle check
    if (feat && activeTenant && activeTenant.features) {
      if (activeTenant.features[feat] === false) {
        return false;
      }
    }

    // 6. Role specific custom permissions on active tenant
    if (feat && activeTenant && activeTenant.rolePermissions && activeTenant.rolePermissions[userRole]) {
      const rolePerms = activeTenant.rolePermissions[userRole];
      if (rolePerms && rolePerms[feat] === false) {
        return false;
      }
    }

    return true;
  };

  const baseMenuStructure: DropdownMenuItem[] = [
    ...(userRole === 'Super Admin' ? [{
      id: 'super_admin_portal',
      label: 'Super Admin Portal',
      iconClass: 'fa-solid fa-shield-halved text-danger',
      targetTab: 'super_admin' as ActiveTab
    }] : []),
    {
      id: 'dashboard_direct',
      label: 'Dashboard',
      iconClass: 'fa-solid fa-gauge-high text-emerald-300',
      targetTab: 'dashboard'
    },
    {
      id: 'customer_site_direct',
      label: 'Customer View Site',
      iconClass: 'fa-solid fa-store text-emerald-300',
      targetTab: 'customer_site',
      requiredFeature: 'customer_site'
    },
    {
      id: 'pos_direct',
      label: 'Point Of Sale',
      iconClass: 'fa-solid fa-cart-shopping text-emerald-300',
      targetTab: 'pos',
      requiredFeature: 'pos'
    },
    {
      id: 'screens',
      label: 'Kitchen Display (KDS)',
      iconClass: 'fa-solid fa-tv text-emerald-300',
      targetTab: 'kds',
      requiredFeature: 'kds'
    },
    {
      id: 'day_ops',
      label: 'Day Operations',
      iconClass: 'fa-solid fa-gear text-emerald-300',
      requiredFeature: 'day_operation',
      subItems: [
        { id: 'order_return', label: 'Order Return', targetTab: 'orders' },
        { id: 'pos_days', label: 'POS Days', targetTab: 'pos_days', requiredFeature: 'pos_days' },
        { id: 'closed_dates', label: 'Closed Dates', targetTab: 'closed_dates' }
      ]
    },
    {
      id: 'floor_mgmt',
      label: 'Floor Management',
      iconClass: 'fa-solid fa-gears text-emerald-300',
      requiredFeature: 'floors',
      subItems: [
        { id: 'show_tables', label: 'Show Tables', targetTab: 'tables' },
        { id: 'floors', label: 'Floors', targetTab: 'floors' }
      ]
    },
    {
      id: 'inventory_grp',
      label: 'Inventory',
      iconClass: 'fa-solid fa-warehouse text-emerald-300',
      requiredFeature: 'inventory',
      subItems: [
        { id: 'stock_overview', label: 'Stock Overview', targetTab: 'inventory' },
        { id: 'low_stock', label: 'Low Stock Alert', targetTab: 'inventory' },
        { id: 'suppliers_list', label: 'Suppliers', targetTab: 'inventory' }
      ]
    },
    {
      id: 'self_orders',
      label: 'Self Orders',
      iconClass: 'fa-solid fa-gear text-emerald-300',
      targetTab: 'orders'
    },
    {
      id: 'waiter_calls',
      label: 'Waiter Calls',
      iconClass: 'fa-solid fa-bell text-emerald-300',
      targetTab: 'tables'
    },
    {
      id: 'reports',
      label: 'Reports',
      iconClass: 'fa-solid fa-chart-pie text-emerald-300',
      requiredFeature: 'reports',
      subItems: [
        { id: 'sale_reports', label: 'Sale Reports', targetTab: 'reports' },
        { id: 'expenses_report', label: 'Expenses Report', targetTab: 'reports' },
        { id: 'customer_ledger', label: 'Customer Ledger', targetTab: 'customers' },
        { id: 'store_variance', label: 'Store Variance', targetTab: 'inventory' }
      ]
    },
    {
      id: 'hotel_menus',
      label: 'Food Menus',
      iconClass: 'fa-solid fa-utensils text-emerald-300',
      requiredFeature: 'food_menus',
      subItems: [
        { id: 'hm_menus', label: 'Food Menus', targetTab: 'menu' },
        { id: 'hm_submenu', label: 'SubMenu', targetTab: 'menu' },
        { id: 'hm_deals', label: 'Deals', targetTab: 'menu' },
        { id: 'hm_combos', label: 'Combos', targetTab: 'menu' },
        { id: 'hm_addons', label: 'Add Ons', targetTab: 'menu' },
        { id: 'hm_lady_drinks', label: 'Lady Drinks', targetTab: 'menu' },
        { id: 'hm_flavors', label: 'Flavors & Stuff', targetTab: 'menu' }
      ]
    },
    {
      id: 'receipts_item',
      label: 'Receipts',
      iconClass: 'fa-solid fa-dollar-sign text-emerald-300',
      requiredFeature: 'receipts',
      targetTab: 'orders'
    },
    {
      id: 'expenses_item',
      label: 'Expenses',
      iconClass: 'fa-solid fa-dollar-sign text-emerald-300',
      targetTab: 'accounting',
      requiredFeature: 'accounting'
    },
    {
      id: 'user_mgmt',
      label: 'User Management',
      iconClass: 'fa-solid fa-users text-emerald-300',
      requiredFeature: 'user_management',
      subItems: [
        { id: 'um_users', label: 'Users', targetTab: 'employees' },
        { id: 'um_emails', label: 'Management Emails', targetTab: 'settings' },
        { id: 'um_rights', label: 'User Rights', targetTab: 'settings' },
        { id: 'um_groups', label: 'User Groups', targetTab: 'employees' }
      ]
    },
    {
      id: 'employees',
      label: 'Employees',
      iconClass: 'fa-solid fa-users-gear text-emerald-300',
      requiredFeature: 'employees',
      subItems: [
        { id: 'emp_depts', label: 'Departments', targetTab: 'employees' },
        { id: 'emp_list', label: 'Employees', targetTab: 'employees' },
        { id: 'emp_degrees', label: 'Degrees', targetTab: 'employees' },
        { id: 'emp_designations', label: 'Designations', targetTab: 'employees' },
        { id: 'emp_offices', label: 'Offices', targetTab: 'employees' },
        { id: 'emp_dropped', label: 'Dropped', targetTab: 'employees' }
      ]
    },
    {
      id: 'app_settings',
      label: 'App Settings',
      iconClass: 'fa-solid fa-gear text-emerald-300',
      requiredFeature: 'app_settings',
      subItems: [
        { id: 'app_super', label: 'Super App Setting', targetTab: 'settings' },
        { id: 'app_kot', label: 'Receipt & KOT Settings', targetTab: 'settings' },
        { id: 'app_general', label: 'General Settings', targetTab: 'settings' },
        { id: 'app_company', label: 'Company', targetTab: 'settings' },
        { id: 'app_pos', label: 'POS Screen Settings', targetTab: 'settings' },
        { id: 'app_old_bill', label: 'Old Bill Settings', targetTab: 'settings' },
        { id: 'app_db', label: 'Database Operations', targetTab: 'settings' }
      ]
    },
    {
      id: 'business_settings',
      label: 'Business Settings',
      iconClass: 'fa-solid fa-gears text-emerald-300',
      requiredFeature: 'business_settings',
      subItems: [
        { id: 'bs_institute', label: 'Institute', targetTab: 'settings' },
        { id: 'bs_branches', label: 'Branches', targetTab: 'settings' },
        { id: 'bs_happy_hours', label: 'Happy Hours', targetTab: 'settings' },
        { id: 'bs_counters', label: 'Counters', targetTab: 'settings' },
        { id: 'bs_shifts', label: 'Manage Shifts', targetTab: 'settings' },
        { id: 'bs_sliders', label: 'Sliders', targetTab: 'settings' }
      ]
    },
    {
      id: 'setups',
      label: 'Setups',
      iconClass: 'fa-solid fa-sitemap text-emerald-300',
      requiredFeature: 'setups',
      subItems: [
        { id: 'su_cust', label: 'Customers', targetTab: 'customers' },
        { id: 'su_taxes', label: 'Taxes', targetTab: 'settings' },
        { id: 'su_mode', label: 'Mode of Payment', targetTab: 'settings' },
        { id: 'su_service', label: 'Service Charges', targetTab: 'settings' },
        { id: 'su_discount', label: 'Discount Keys', targetTab: 'settings' },
        { id: 'su_order_types', label: 'Order Types', targetTab: 'settings' },
        { id: 'su_reasons', label: 'Reasons', targetTab: 'settings' },
        { id: 'su_delivery', label: 'Delivery Charges', targetTab: 'settings' }
      ]
    }
  ];

  const visibleMenuStructure = baseMenuStructure
    .map(item => {
      // 1. Check if item itself is allowed
      if (!isFeatureAllowed(item.requiredFeature, item.targetTab)) {
        return null;
      }

      // 2. If item has subItems, filter subItems
      if (item.subItems && item.subItems.length > 0) {
        const filteredSubs = item.subItems.filter(sub => 
          isFeatureAllowed(sub.requiredFeature, sub.targetTab)
        );
        if (filteredSubs.length === 0) return null;
        return { ...item, subItems: filteredSubs };
      }

      return item;
    })
    .filter((item): item is DropdownMenuItem => item !== null);

  const sidebarWidth = isCollapsed ? '76px' : '260px';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1039, backdropFilter: 'blur(4px)' }}
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`sidebar-container min-vh-100 d-flex flex-column justify-content-between position-sticky top-0 ${
          isMobileOpen ? 'position-fixed start-0 top-0 h-100 shadow-lg' : 'd-none d-md-flex'
        }`}
        style={{
          width: isMobileOpen ? '260px' : sidebarWidth,
          minWidth: isMobileOpen ? '260px' : sidebarWidth,
          flexShrink: 0,
          zIndex: 1040,
          height: '100vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, #18604d 0%, #124337 40%, #0d2e26 100%)',
          color: '#ffffff',
          boxShadow: '2px 0 10px rgba(0,0,0,0.25)'
        }}
      >
        <div>
          {/* Header Controls */}
          <div className="p-3 d-flex align-items-center justify-content-between border-bottom border-emerald-800/40">
            {!isCollapsed && (
              <button
                onClick={() => onSelectTab('dashboard')}
                className="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2 text-white border-0 bg-transparent text-start"
                title="Redirect to Dashboard"
              >
                <i className="fa-solid fa-gauge-high text-emerald-300 text-lg"></i>
                <span className="fw-bold text-white tracking-wide text-sm font-display">Dashboard</span>
              </button>
            )}

            <div className="d-flex align-items-center gap-1 ms-auto">
              {onCloseMobile && isMobileOpen && (
                <button
                  onClick={onCloseMobile}
                  className="btn btn-sm text-emerald-200 p-1 d-md-none hover:text-white"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {onToggleCollapse && !isMobileOpen && (
                <button
                  onClick={onToggleCollapse}
                  className="btn btn-sm text-emerald-200 p-1 rounded-2 d-none d-md-flex align-items-center justify-content-center hover:bg-emerald-800/50"
                  title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  style={{ width: '28px', height: '28px' }}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>


          {/* Nav Items List */}
          <nav className="py-2">
            {visibleMenuStructure.map((menuItem) => {
              const hasSubItems = menuItem.subItems && menuItem.subItems.length > 0;
              const isOpen = !!openDropdowns[menuItem.id];
              const isDirectActive = menuItem.targetTab && activeTab === menuItem.targetTab && !hasSubItems;

              return (
                <div key={menuItem.id} className="mb-0.5">
                  {/* Direct Item or Dropdown Header */}
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleDropdown(menuItem.id)}
                      className={`w-100 border-0 text-start d-flex align-items-center justify-content-between px-3 py-2.5 transition-all ${
                        isOpen ? 'bg-emerald-800/60 text-white font-semibold' : 'text-emerald-100 hover:bg-emerald-800/30'
                      }`}
                      style={{ background: isOpen ? '#1e6d58' : 'transparent', fontSize: '0.9rem' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 min-w-0">
                        <i className={`${menuItem.iconClass} fa-fw text-center style-icon`} style={{ width: '18px' }}></i>
                        {!isCollapsed && <span className="text-truncate fw-medium">{menuItem.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <ChevronDown
                          className={`w-4 h-4 text-emerald-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (menuItem.targetTab) {
                          onSelectTab(menuItem.targetTab);
                          setActiveSubItem(menuItem.id);
                          if (onCloseMobile) onCloseMobile();
                        }
                      }}
                      className={`w-100 border-0 text-start d-flex align-items-center justify-content-between px-3 py-2.5 transition-all ${
                        isDirectActive ? 'bg-emerald-700 text-white fw-bold shadow-sm' : 'text-emerald-100 hover:bg-emerald-800/30'
                      }`}
                      style={{ background: isDirectActive ? '#217861' : 'transparent', fontSize: '0.9rem' }}
                    >
                      <div className="d-flex align-items-center gap-2.5 min-w-0">
                        <i className={`${menuItem.iconClass} fa-fw text-center style-icon`} style={{ width: '18px' }}></i>
                        {!isCollapsed && <span className="text-truncate fw-medium">{menuItem.label}</span>}
                      </div>
                    </button>
                  )}

                  {/* SubMenu Items */}
                  {hasSubItems && isOpen && !isCollapsed && (
                    <div className="bg-emerald-950/40 py-1 transition-all" style={{ background: '#0d2821' }}>
                      {menuItem.subItems!.map((sub) => {
                        const isSubActive = activeSubItem === sub.id || (activeTab === sub.targetTab && activeSubItem === sub.id);

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              onSelectTab(sub.targetTab);
                              setActiveSubItem(sub.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`w-100 border-0 text-start d-block ps-5 pe-3 py-1.5 text-sm transition-all ${
                              isSubActive ? 'text-white fw-bold bg-emerald-800/50' : 'text-emerald-100 hover:text-white hover:bg-emerald-800/20'
                            }`}
                            style={{
                              fontSize: '0.84rem',
                              letterSpacing: '0.01em',
                              background: isSubActive ? '#165746' : 'transparent'
                            }}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="p-3 border-top border-emerald-800/40 text-center text-emerald-200/70" style={{ fontSize: '0.72rem' }}>
            POS Management v2.4
          </div>
        )}
      </aside>
    </>
  );
};
