import React, { useState } from 'react';
import {
  RestaurantTenant,
  RestaurantFeatures,
  RestaurantFeatureKey,
  UserRole,
  RolePermissions
} from '../../types';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sliders,
  Users,
  Check,
  Lock,
  Zap,
  Edit2,
  ToggleLeft,
  ToggleRight,
  Store,
  DollarSign,
  Info,
  RotateCcw,
  Eye
} from 'lucide-react';

interface SuperAdminViewProps {
  tenants: RestaurantTenant[];
  activeTenantId: string;
  onUpdateTenants: (tenants: RestaurantTenant[]) => void;
  onSelectActiveTenant: (tenantId: string) => void;
  isDarkMode: boolean;
}

const FEATURE_METADATA: { key: RestaurantFeatureKey; label: string; desc: string; icon: string }[] = [
  { key: 'pos', label: 'Point of Sale (POS)', desc: 'Order entry, reception checkout & bills', icon: 'fa-cart-shopping' },
  { key: 'kds', label: 'Kitchen Display (KDS)', desc: 'Real-time kitchen order screen & KOT', icon: 'fa-tv' },
  { key: 'inventory', label: 'Inventory & Stock', desc: 'Stock movements, suppliers & low alerts', icon: 'fa-warehouse' },
  { key: 'floors', label: 'Floor & Table Layouts', desc: 'Visual floor maps, areas & table statuses', icon: 'fa-border-all' },
  { key: 'customer_site', label: 'Customer Online Menu', desc: 'Public QR ordering & customer portal', icon: 'fa-globe' },
  { key: 'reservations', label: 'Table Reservations', desc: 'Dine-in guest booking & table assignment', icon: 'fa-calendar-check' },
  { key: 'delivery', label: 'Delivery & Drivers', desc: 'Driver dispatch & delivery tracking', icon: 'fa-truck-fast' },
  { key: 'accounting', label: 'Expenses & Ledger', desc: 'Business expenses & financial tracking', icon: 'fa-money-bill-transfer' },
  { key: 'reports', label: 'Reports & Analytics', desc: 'Sales breakdown, Kpis & store variance', icon: 'fa-chart-column' },
  { key: 'employees', label: 'Staff & HR Management', desc: 'Employee profiles, shifts & attendance', icon: 'fa-users' },
  { key: 'pos_days', label: 'POS Day Shifts', desc: 'Opening/Closing float & daily closing', icon: 'fa-clock' },
  { key: 'app_settings', label: 'App Settings', desc: 'Receipt, KOT, POS screen & company setup', icon: 'fa-gear' },
  { key: 'business_settings', label: 'Business Settings', desc: 'Institute, branches, happy hours, counters & shifts', icon: 'fa-gears' },
  { key: 'setups', label: 'Setups', desc: 'Taxes, payment modes, charges & discount keys', icon: 'fa-sitemap' },
  { key: 'user_management', label: 'User Management', desc: 'Users, management emails, user rights & groups', icon: 'fa-users' },
  { key: 'receipts', label: 'Receipts', desc: 'Transaction receipts & order records', icon: 'fa-dollar-sign' },
  { key: 'food_menus', label: 'Food Menus', desc: 'Menus, submenus, deals, combos & add-ons', icon: 'fa-utensils' },
  { key: 'day_operation', label: 'Day Operations', desc: 'Order return, POS days & closed dates', icon: 'fa-clock' }
];

const DEFAULT_ALL_FEATURES: RestaurantFeatures = {
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
};

export const ALL_ROLES: UserRole[] = [
  'Super Admin',
  'Restaurant Owner',
  'Branch Manager',
  'Cashier',
  'Waiter',
  'Kitchen Staff',
  'Inventory Manager',
  'Accountant',
  'Shift Supervisor',
  'Delivery Driver',
  'Customer'
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  'Super Admin': { pos: true, kds: true, inventory: true, floors: true, customer_site: true, reservations: true, delivery: true, accounting: true, reports: true, employees: true, pos_days: true, app_settings: true, business_settings: true, setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true },
  'Restaurant Owner': { pos: true, kds: true, inventory: true, floors: true, customer_site: true, reservations: true, delivery: true, accounting: true, reports: true, employees: true, pos_days: true, app_settings: true, business_settings: true, setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true },
  'Branch Manager': { pos: true, kds: true, inventory: true, floors: true, customer_site: true, reservations: true, delivery: true, accounting: true, reports: true, employees: true, pos_days: true, app_settings: true, business_settings: true, setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true },
  'Cashier': { pos: true, kds: false, inventory: false, floors: true, customer_site: true, reservations: true, delivery: true, accounting: false, reports: false, employees: false, pos_days: true, app_settings: false, business_settings: false, setups: false, user_management: false, receipts: true, food_menus: true, day_operation: true },
  'Waiter': { pos: true, kds: true, inventory: false, floors: true, customer_site: true, reservations: true, delivery: false, accounting: false, reports: false, employees: false, pos_days: false, app_settings: false, business_settings: false, setups: false, user_management: false, receipts: true, food_menus: true, day_operation: false },
  'Kitchen Staff': { pos: false, kds: true, inventory: true, floors: false, customer_site: false, reservations: false, delivery: false, accounting: false, reports: false, employees: false, pos_days: false, app_settings: false, business_settings: false, setups: false, user_management: false, receipts: false, food_menus: true, day_operation: false },
  'Inventory Manager': { pos: false, kds: false, inventory: true, floors: false, customer_site: false, reservations: false, delivery: false, accounting: true, reports: true, employees: false, pos_days: false, app_settings: false, business_settings: false, setups: true, user_management: false, receipts: true, food_menus: false, day_operation: false },
  'Accountant': { pos: false, kds: false, inventory: true, floors: false, customer_site: false, reservations: false, delivery: false, accounting: true, reports: true, employees: true, pos_days: true, app_settings: true, business_settings: true, setups: true, user_management: false, receipts: true, food_menus: false, day_operation: true },
  'Shift Supervisor': { pos: true, kds: true, inventory: true, floors: true, customer_site: true, reservations: true, delivery: true, accounting: false, reports: true, employees: true, pos_days: true, app_settings: false, business_settings: true, setups: true, user_management: true, receipts: true, food_menus: true, day_operation: true },
  'Delivery Driver': { pos: false, kds: false, inventory: false, floors: false, customer_site: true, reservations: false, delivery: true, accounting: false, reports: false, employees: false, pos_days: false, app_settings: false, business_settings: false, setups: false, user_management: false, receipts: false, food_menus: false, day_operation: false },
  'Customer': { pos: false, kds: false, inventory: false, floors: false, customer_site: true, reservations: true, delivery: true, accounting: false, reports: false, employees: false, pos_days: false, app_settings: false, business_settings: false, setups: false, user_management: false, receipts: false, food_menus: true, day_operation: false }
};

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  tenants,
  activeTenantId,
  onUpdateTenants,
  onSelectActiveTenant,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'matrix' | 'roles'>('tenants');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [editingTenant, setEditingTenant] = useState<RestaurantTenant | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formOwnerName, setFormOwnerName] = useState<string>('');
  const [formUsername, setFormUsername] = useState<string>('');
  const [formPin, setFormPin] = useState<string>('1234');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formPlan, setFormPlan] = useState<'Starter' | 'Pro' | 'Enterprise' | 'Custom'>('Pro');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended' | 'Trial' | 'Expired'>('Active');
  const [formCurrency, setFormCurrency] = useState<string>('$');
  const [formTaxRate, setFormTaxRate] = useState<number>(5);
  const [formLogo, setFormLogo] = useState<string>('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80');
  const [formFeatures, setFormFeatures] = useState<RestaurantFeatures>({ ...DEFAULT_ALL_FEATURES });
  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});

  const togglePinVisibility = (tenantId: string) => {
    setVisiblePins(prev => ({ ...prev, [tenantId]: !prev[tenantId] }));
  };

  // Feature Limits Modal State for specific restaurant
  const [selectedTenantForLimits, setSelectedTenantForLimits] = useState<RestaurantTenant | null>(null);

  // Selected Tenant for Role Permissions Matrix
  const [selectedRoleTenantId, setSelectedRoleTenantId] = useState<string>(activeTenantId || tenants[0]?.id || '');

  const currentRoleTenant = tenants.find(t => t.id === selectedRoleTenantId) || tenants[0];

  const handleToggleRolePermission = (role: UserRole, featureKey: RestaurantFeatureKey) => {
    if (!currentRoleTenant) return;
    const updated = tenants.map(t => {
      if (t.id === currentRoleTenant.id) {
        const tenantRolePerms = t.rolePermissions || { ...DEFAULT_ROLE_PERMISSIONS };
        const currentRoleMap = tenantRolePerms[role] || { ...(DEFAULT_ROLE_PERMISSIONS[role] || {}) };
        const updatedRoleMap = {
          ...currentRoleMap,
          [featureKey]: !currentRoleMap[featureKey]
        };
        return {
          ...t,
          rolePermissions: {
            ...tenantRolePerms,
            [role]: updatedRoleMap
          }
        };
      }
      return t;
    });
    onUpdateTenants(updated);
  };

  const handleSetAllForRole = (role: UserRole, enable: boolean) => {
    if (!currentRoleTenant) return;
    const updated = tenants.map(t => {
      if (t.id === currentRoleTenant.id) {
        const tenantRolePerms = t.rolePermissions || { ...DEFAULT_ROLE_PERMISSIONS };
        const newRoleMap: Record<RestaurantFeatureKey, boolean> = { ...DEFAULT_ALL_FEATURES };
        FEATURE_METADATA.forEach(f => {
          newRoleMap[f.key] = enable;
        });
        return {
          ...t,
          rolePermissions: {
            ...tenantRolePerms,
            [role]: newRoleMap
          }
        };
      }
      return t;
    });
    onUpdateTenants(updated);
  };

  const handleResetTenantRolePermissions = () => {
    if (!currentRoleTenant) return;
    const updated = tenants.map(t => {
      if (t.id === currentRoleTenant.id) {
        return {
          ...t,
          rolePermissions: JSON.parse(JSON.stringify(DEFAULT_ROLE_PERMISSIONS))
        };
      }
      return t;
    });
    onUpdateTenants(updated);
  };

  const resetForm = () => {
    setFormName('');
    const nextCode = 'REST-00' + (tenants.length + 1);
    setFormCode(nextCode);
    setFormOwnerName('');
    setFormUsername(nextCode.toLowerCase().replace('-', '_'));
    setFormPin('1234');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormPlan('Pro');
    setFormStatus('Active');
    setFormCurrency('$');
    setFormTaxRate(5);
    setFormLogo('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80');
    setFormFeatures({ ...DEFAULT_ALL_FEATURES });
    setEditingTenant(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowRegisterModal(true);
  };

  const handleOpenEditModal = (t: RestaurantTenant) => {
    setEditingTenant(t);
    setFormName(t.name);
    setFormCode(t.code);
    setFormOwnerName(t.ownerName);
    setFormUsername(t.username || t.code.toLowerCase().replace('-', '_'));
    setFormPin(t.pin || '1234');
    setFormEmail(t.email);
    setFormPhone(t.phone);
    setFormAddress(t.address);
    setFormPlan(t.plan);
    setFormStatus(t.status);
    setFormCurrency(t.currencySymbol);
    setFormTaxRate(t.taxRate);
    setFormLogo(t.logo);
    setFormFeatures({ ...t.features });
    setShowRegisterModal(true);
  };

  const handleSaveTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const finalUsername = formUsername.trim() || formCode.toLowerCase().replace('-', '_');
    const finalPin = formPin.trim() || '1234';

    if (editingTenant) {
      const updatedList = tenants.map(t => {
        if (t.id === editingTenant.id) {
          return {
            ...t,
            name: formName,
            code: formCode,
            ownerName: formOwnerName,
            username: finalUsername,
            pin: finalPin,
            email: formEmail,
            phone: formPhone,
            address: formAddress,
            plan: formPlan,
            status: formStatus,
            currencySymbol: formCurrency,
            taxRate: formTaxRate,
            logo: formLogo,
            features: { ...formFeatures }
          };
        }
        return t;
      });
      onUpdateTenants(updatedList);
    } else {
      const newTenant: RestaurantTenant = {
        id: 'rest-' + Date.now(),
        code: formCode || ('REST-00' + (tenants.length + 1)),
        name: formName,
        ownerName: formOwnerName || 'Restaurant Owner',
        username: finalUsername,
        pin: finalPin,
        email: formEmail || 'owner@restaurant.com',
        phone: formPhone || '+252 61 000 0000',
        address: formAddress || 'Mogadishu, Somalia',
        plan: formPlan,
        status: formStatus,
        currencySymbol: formCurrency || '$',
        taxRate: formTaxRate,
        logo: formLogo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=160&q=80',
        createdAt: new Date().toISOString().split('T')[0],
        features: { ...formFeatures }
      };
      onUpdateTenants([...tenants, newTenant]);
    }

    setShowRegisterModal(false);
    resetForm();
  };

  const handleToggleSingleFeature = (tenantId: string, featureKey: RestaurantFeatureKey) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          features: {
            ...t.features,
            [featureKey]: !t.features[featureKey]
          }
        };
      }
      return t;
    });
    onUpdateTenants(updated);
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.status === 'Active' ? 'Suspended' : 'Active';
        return { ...t, status: nextStatus as any };
      }
      return t;
    });
    onUpdateTenants(updated);
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTenantsCount = tenants.filter(t => t.status === 'Active').length;

  return (
    <div className={`p-4 min-vh-100 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      
      {/* Top Header Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-danger bg-opacity-10 text-danger rounded-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="h4 fw-bold mb-0">Super Admin Portal</h1>
              <p className="small text-muted mb-0">Master Control Center for Multi-Restaurant Tenants, Feature Allocations & Role Rights</p>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-danger fw-bold d-flex align-items-center gap-2 shadow-sm rounded-3 px-3 py-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Restaurant</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm p-3 rounded-3 h-100 ${isDarkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-semibold">TOTAL RESTAURANTS</span>
              <Building2 className="w-5 h-5 text-danger" />
            </div>
            <h2 className="h3 fw-bold mb-0">{tenants.length}</h2>
            <span className="small text-muted mt-1 d-block">{activeTenantsCount} currently active</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm p-3 rounded-3 h-100 ${isDarkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-semibold">ACTIVE SYSTEM ROLES</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h2 className="h3 fw-bold mb-0">8 Roles</h2>
            <span className="small text-muted mt-1 d-block">Super Admin to Staff</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm p-3 rounded-3 h-100 ${isDarkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-semibold">MODULE FEATURES</span>
              <Sliders className="w-5 h-5 text-success" />
            </div>
            <h2 className="h3 fw-bold mb-0">18 Modules</h2>
            <span className="small text-muted mt-1 d-block">Per-Tenant Feature Limiter</span>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className={`card border-0 shadow-sm p-3 rounded-3 h-100 ${isDarkMode ? 'bg-dark border border-secondary text-white' : 'bg-white'}`}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small text-muted fw-semibold">CURRENT CONTEXT</span>
              <Store className="w-5 h-5 text-warning" />
            </div>
            <h2 className="h6 fw-bold text-truncate mb-0">
              {tenants.find(t => t.id === activeTenantId)?.name || 'Default Restaurant'}
            </h2>
            <span className="badge bg-success-subtle text-success mt-1 align-self-start">Live Selected</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <ul className="nav nav-pills gap-2 border-bottom pb-3 mb-4">
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'tenants' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            <Building2 className="w-4 h-4" />
            <span>Registered Restaurants ({tenants.length})</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'matrix' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            <Sliders className="w-4 h-4" />
            <span>Feature Control & Limits Matrix</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('roles')}
            className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeTab === 'roles' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            <Users className="w-4 h-4" />
            <span>Roles & Permissions Authority</span>
          </button>
        </li>
      </ul>

      {/* TAB 1: REGISTERED RESTAURANTS LIST & MANAGEMENT */}
      {activeTab === 'tenants' && (
        <div>
          {/* Controls toolbar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '480px' }}>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search className="w-4 h-4 text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search restaurant by name, code, owner, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <label className="small fw-semibold text-muted mb-0">Status:</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '140px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Restaurant Cards Grid */}
          <div className="row g-4">
            {filteredTenants.map((tenant) => {
              const isSelectedContext = tenant.id === activeTenantId;
              const enabledFeaturesCount = Object.values(tenant.features).filter(Boolean).length;
              const totalFeaturesCount = FEATURE_METADATA.length;

              return (
                <div key={tenant.id} className="col-12 col-md-6 col-xl-4">
                  <div className={`card h-100 border-0 shadow-sm rounded-3 overflow-hidden transition-all ${
                    isSelectedContext ? 'ring-2 ring-danger border border-danger' : isDarkMode ? 'bg-dark border border-secondary' : 'bg-white'
                  }`}>
                    
                    {/* Card Header */}
                    <div className="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2.5 min-w-0">
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="rounded-circle object-cover border"
                          style={{ width: '42px', height: '42px' }}
                        />
                        <div className="min-w-0">
                          <div className="d-flex align-items-center gap-1.5">
                            <span className="font-monospace text-xs text-danger fw-bold">{tenant.code}</span>
                            <span className={`badge ${
                              tenant.status === 'Active' ? 'bg-success' :
                              tenant.status === 'Trial' ? 'bg-info text-dark' : 'bg-danger'
                            }`} style={{ fontSize: '0.68rem' }}>
                              {tenant.status}
                            </span>
                          </div>
                          <h2 className="h6 fw-bold mb-0 text-truncate text-dark">{tenant.name}</h2>
                        </div>
                      </div>

                      {isSelectedContext && (
                        <span className="badge bg-danger text-white px-2 py-1 small">Active Context</span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-3">
                      <div className="small mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Owner:</span>
                          <span className="fw-semibold">{tenant.ownerName}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Contact:</span>
                          <span className="font-monospace text-truncate">{tenant.email}</span>
                        </div>
                        
                        {/* Tenant Login Credentials Box */}
                        <div className="p-2 rounded-2 my-2 bg-light border border-secondary-subtle">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="text-dark fw-bold text-xs">Login Username:</span>
                            <span className="font-monospace fw-bold text-danger">{tenant.username || tenant.code.toLowerCase().replace('-', '_')}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-dark fw-bold text-xs">Security PIN:</span>
                            <div className="d-flex align-items-center gap-1">
                              <span className="font-monospace fw-bold text-primary">
                                {visiblePins[tenant.id] ? (tenant.pin || '1234') : '••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePinVisibility(tenant.id)}
                                className="btn btn-xs text-muted p-0 ms-1"
                                title="Show/Hide Security PIN"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex justify-content-between mb-1">
                          <span className="text-muted">Plan & Tax:</span>
                          <span className="fw-bold text-primary">{tenant.plan} Plan ({tenant.taxRate}% Tax)</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Address:</span>
                          <span className="text-truncate text-muted">{tenant.address}</span>
                        </div>
                      </div>

                      {/* Feature allocation pills */}
                      <div className="mb-3 pt-2 border-top">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="small fw-semibold text-muted">Allocated Features:</span>
                          <span className="badge bg-secondary-subtle text-secondary font-monospace">
                            {enabledFeaturesCount} / {totalFeaturesCount} Enabled
                          </span>
                        </div>

                        <div className="d-flex flex-wrap gap-1">
                          {FEATURE_METADATA.map((f) => {
                            const isEnabled = tenant.features[f.key];
                            return (
                              <span
                                key={f.key}
                                className={`badge px-2 py-1 ${
                                  isEnabled ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-light text-muted border text-decoration-line-through opacity-60'
                                }`}
                                style={{ fontSize: '0.72rem' }}
                                title={`${f.label}: ${isEnabled ? 'Enabled' : 'Disabled / Limited'}`}
                              >
                                {f.label.split(' ')[0]}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-light border-top d-flex align-items-center justify-content-between gap-2">
                      <button
                        onClick={() => onSelectActiveTenant(tenant.id)}
                        disabled={isSelectedContext}
                        className={`btn btn-sm fw-bold flex-grow-1 ${
                          isSelectedContext ? 'btn-outline-danger disabled' : 'btn-outline-primary'
                        }`}
                      >
                        {isSelectedContext ? 'Selected Context' : 'Switch Context'}
                      </button>

                      <button
                        onClick={() => setSelectedTenantForLimits(tenant)}
                        className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                        title="Configure feature toggles & limit rules"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Limits</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(tenant)}
                        className="btn btn-sm btn-outline-secondary p-1.5"
                        title="Edit restaurant details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleTenantStatus(tenant.id)}
                        className={`btn btn-sm p-1.5 ${tenant.status === 'Active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        title={tenant.status === 'Active' ? 'Suspend Restaurant' : 'Activate Restaurant'}
                      >
                        {tenant.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE CONTROL & LIMITS MATRIX */}
      {activeTab === 'matrix' && (
        <div className={`card border-0 shadow-sm rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
          <div className="p-3 border-bottom bg-light text-dark d-flex align-items-center justify-content-between">
            <div>
              <h2 className="h6 fw-bold mb-0">Restaurant Feature Allocation & Limitation Matrix</h2>
              <p className="small text-muted mb-0">Toggle modules ON or OFF for any restaurant. Disabled features are restricted in the sidebar & system navigation.</p>
            </div>
            <span className="badge bg-danger">Super Admin Authority</span>
          </div>

          <div className="table-responsive p-3">
            <table className={`table table-hover align-middle mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
              <thead className={isDarkMode ? 'table-dark' : 'table-light'}>
                <tr>
                  <th style={{ minWidth: '220px' }}>Module / Feature</th>
                  {tenants.map(t => (
                    <th key={t.id} className="text-center" style={{ minWidth: '160px' }}>
                      <div className="fw-bold text-truncate" style={{ maxWidth: '160px' }}>{t.name}</div>
                      <span className="small text-muted font-monospace font-normal">{t.code}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_METADATA.map((f) => (
                  <tr key={f.key}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`fa-solid ${f.icon} text-danger style-icon`} style={{ width: '18px' }}></i>
                        <div>
                          <div className="fw-bold small">{f.label}</div>
                          <div className="text-muted text-xs">{f.desc}</div>
                        </div>
                      </div>
                    </td>

                    {tenants.map(t => {
                      const isEnabled = t.features[f.key];
                      return (
                        <td key={t.id} className="text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSingleFeature(t.id, f.key)}
                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold transition-all d-inline-flex align-items-center gap-1.5 ${
                              isEnabled ? 'btn-success' : 'btn-outline-secondary opacity-60'
                            }`}
                          >
                            {isEnabled ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>ENABLED</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>LIMITED</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & GRANULAR PERMISSIONS AUTHORITY */}
      {activeTab === 'roles' && (
        <div className="d-flex flex-column gap-4">
          
          {/* Header Card & Restaurant Selector */}
          <div className={`card border-0 shadow-sm rounded-3 p-4 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom pb-3 mb-3">
              <div>
                <h2 className="h6 fw-bold mb-1 d-flex align-items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-danger" />
                  <span>Granular Role-Based Feature Access Control</span>
                </h2>
                <p className="small text-muted mb-0">
                  Configure feature visibility and functional access (Inventory, POS, Accounting, KDS, etc.) for each individual user role per restaurant.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <label className="small fw-semibold text-muted mb-0 text-nowrap">Target Restaurant:</label>
                <select
                  className="form-select form-select-sm fw-bold border-danger-subtle"
                  style={{ minWidth: '220px' }}
                  value={selectedRoleTenantId}
                  onChange={(e) => setSelectedRoleTenantId(e.target.value)}
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleResetTenantRolePermissions}
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5"
                  title="Reset role permissions to default template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* Notice Banner */}
            <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between gap-2 rounded-3 text-xs">
              <div className="d-flex align-items-center gap-2">
                <Info className="w-4 h-4 text-info flex-shrink-0" />
                <span>
                  <strong>Tenant Limitation Rule:</strong> Features marked as <strong>LOCKED</strong> at the restaurant tenant level remain inaccessible regardless of role permission settings.
                </span>
              </div>
              <span className="badge bg-info-subtle text-info fw-bold">Active Store: {currentRoleTenant?.name}</span>
            </div>

            {/* Granular Permission Matrix Table */}
            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className={`table table-bordered table-hover align-middle mb-0 text-center ${isDarkMode ? 'table-dark' : ''}`}>
                <thead className={`sticky-top ${isDarkMode ? 'table-dark' : 'table-light'}`} style={{ zIndex: 10 }}>
                  <tr>
                    <th className="text-start px-3" style={{ minWidth: '180px' }}>User Role</th>
                    {FEATURE_METADATA.map(f => (
                      <th key={f.key} style={{ minWidth: '110px', fontSize: '0.78rem' }} className="py-2">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <i className={`fa-solid ${f.icon} text-danger`} style={{ fontSize: '0.9rem' }}></i>
                          <span className="text-truncate" style={{ maxWidth: '100px' }}>{f.label.split('(')[0].trim()}</span>
                        </div>
                      </th>
                    ))}
                    <th style={{ minWidth: '130px', fontSize: '0.78rem' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_ROLES.map(role => {
                    const isSuperAdmin = role === 'Super Admin';
                    const tenantRolePerms = currentRoleTenant?.rolePermissions || DEFAULT_ROLE_PERMISSIONS;
                    const roleMap = tenantRolePerms[role] || DEFAULT_ROLE_PERMISSIONS[role] || {};

                    return (
                      <tr key={role}>
                        <td className="text-start px-3 fw-bold">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${
                              role === 'Super Admin' ? 'bg-danger' :
                              role === 'Restaurant Owner' ? 'bg-dark' :
                              role === 'Branch Manager' ? 'bg-primary' :
                              role === 'Cashier' ? 'bg-success' :
                              role === 'Waiter' ? 'bg-info text-dark' :
                              role === 'Kitchen Staff' ? 'bg-warning text-dark' :
                              role === 'Inventory Manager' ? 'bg-secondary' :
                              role === 'Accountant' ? 'bg-purple text-white' : 'bg-light text-dark border'
                            }`} style={{ fontSize: '0.72rem' }}>
                              {role}
                            </span>
                          </div>
                        </td>

                        {FEATURE_METADATA.map(f => {
                          const tenantHasFeature = currentRoleTenant?.features[f.key] !== false;
                          const roleHasAccess = isSuperAdmin ? true : (roleMap[f.key] !== false);

                          return (
                            <td key={f.key} className="p-1">
                              {isSuperAdmin ? (
                                <span className="badge bg-success-subtle text-success border border-success" style={{ fontSize: '0.65rem' }}>
                                  FULL
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleRolePermission(role, f.key)}
                                  disabled={!tenantHasFeature}
                                  title={
                                    !tenantHasFeature 
                                      ? `${f.label} is locked at restaurant level` 
                                      : `Click to ${roleHasAccess ? 'disable' : 'enable'} ${f.label} for ${role}`
                                  }
                                  className={`btn btn-sm w-100 py-1 px-1 rounded-2 transition-all d-flex align-items-center justify-content-center gap-1 ${
                                    !tenantHasFeature 
                                      ? 'btn-light border text-muted opacity-40' 
                                      : roleHasAccess 
                                        ? 'btn-success bg-opacity-90 text-white' 
                                        : 'btn-outline-secondary opacity-60'
                                  }`}
                                  style={{ fontSize: '0.68rem', height: '28px' }}
                                >
                                  {!tenantHasFeature ? (
                                    <Lock className="w-3 h-3" />
                                  ) : roleHasAccess ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>ON</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 text-danger" />
                                      <span>OFF</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}

                        <td className="p-1">
                          {isSuperAdmin ? (
                            <span className="small text-muted font-monospace">Master</span>
                          ) : (
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              <button
                                onClick={() => handleSetAllForRole(role, true)}
                                className="btn btn-xs btn-outline-success py-0.5 px-1.5 rounded"
                                style={{ fontSize: '0.65rem' }}
                                title="Grant all features to role"
                              >
                                All On
                              </button>
                              <button
                                onClick={() => handleSetAllForRole(role, false)}
                                className="btn btn-xs btn-outline-danger py-0.5 px-1.5 rounded"
                                style={{ fontSize: '0.65rem' }}
                                title="Revoke all features from role"
                              >
                                All Off
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Scope Cards Summary */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-3 rounded-3 bg-primary bg-opacity-10 border border-primary-subtle text-dark">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h3 className="h6 fw-bold text-primary mb-0">Management & Owners</h3>
                </div>
                <p className="small text-muted mb-0">
                  Full control over sales, staff, pricing, financial ledgers, and operational reports across branches.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-3 rounded-3 bg-success bg-opacity-10 border border-success-subtle text-dark">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Store className="w-4 h-4 text-success" />
                  <h3 className="h6 fw-bold text-success mb-0">Front-of-House (POS & Waiters)</h3>
                </div>
                <p className="small text-muted mb-0">
                  Order creation, table seating layouts, bill printouts, payment handling, and shift floats.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm p-3 rounded-3 bg-warning bg-opacity-10 border border-warning-subtle text-dark">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-warning" />
                  <h3 className="h6 fw-bold text-warning-emphasis mb-0">Back-of-House (Kitchen & Stock)</h3>
                </div>
                <p className="small text-muted mb-0">
                  Kitchen order screens (KDS), stock inventory intake, supplier purchase orders, and ingredient alerts.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: REGISTER / EDIT RESTAURANT */}
      {showRegisterModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content border-0 shadow-lg rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold">
                  {editingTenant ? `Edit Restaurant - ${editingTenant.name}` : 'Register New Restaurant Tenant'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRegisterModal(false)} />
              </div>

              <form onSubmit={handleSaveTenantSubmit}>
                <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-8">
                      <label className="form-label small fw-semibold">Restaurant Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Blue Ocean Bistro"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small fw-semibold">Tenant Code</label>
                      <input
                        type="text"
                        className="form-control font-monospace fw-bold"
                        required
                        placeholder="REST-005"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Owner / Director Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Hassan Farah"
                        value={formOwnerName}
                        onChange={(e) => setFormOwnerName(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="owner@restaurant.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>

                    {/* Portal Credentials Section */}
                    <div className="col-12">
                      <div className="p-3 rounded-3 bg-light border border-primary-subtle">
                        <label className="form-label small fw-bold text-primary mb-2 d-flex align-items-center gap-1.5">
                          <Lock className="w-4 h-4" />
                          <span>Restaurant Branch Login Credentials</span>
                        </label>
                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <label className="form-label text-xs fw-semibold">Login Username *</label>
                            <input
                              type="text"
                              className="form-control form-control-sm font-monospace fw-bold"
                              required
                              placeholder="e.g. palace_bistro"
                              value={formUsername}
                              onChange={(e) => setFormUsername(e.target.value)}
                            />
                          </div>
                          <div className="col-12 col-md-6">
                            <label className="form-label text-xs fw-semibold">Security PIN Code *</label>
                            <input
                              type="text"
                              className="form-control form-control-sm font-monospace fw-bold"
                              required
                              placeholder="e.g. 1234"
                              value={formPin}
                              onChange={(e) => setFormPin(e.target.value)}
                            />
                          </div>
                        </div>
                        <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                          These credentials allow this restaurant owner or branch manager to log into their system portal.
                        </span>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+252 61 000 0000"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Subscription Plan</label>
                      <select
                        className="form-select fw-bold"
                        value={formPlan}
                        onChange={(e) => setFormPlan(e.target.value as any)}
                      >
                        <option value="Starter">Starter Plan</option>
                        <option value="Pro">Pro Plan</option>
                        <option value="Enterprise">Enterprise Plan</option>
                        <option value="Custom">Custom Plan</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold">Account Status</label>
                      <select
                        className="form-select fw-bold"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                      >
                        <option value="Active">Active</option>
                        <option value="Trial">Trial</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold">Currency Symbol</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-4">
                      <label className="form-label small fw-semibold">Tax Rate (%)</label>
                      <input
                        type="number"
                        className="form-control font-monospace"
                        value={formTaxRate}
                        onChange={(e) => setFormTaxRate(parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Address / Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street, District, City"
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Logo URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={formLogo}
                        onChange={(e) => setFormLogo(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Feature allocation toggles section */}
                  <div className="border-top pt-3">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                      <Sliders className="w-4 h-4 text-danger" />
                      <span>Feature Allocations & Module Limits</span>
                    </h6>

                    <div className="row g-2">
                      {FEATURE_METADATA.map((f) => {
                        const isChecked = formFeatures[f.key];
                        return (
                          <div key={f.key} className="col-12 col-md-6">
                            <div
                              onClick={() => setFormFeatures(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                              className={`p-2.5 rounded-3 border cursor-pointer d-flex align-items-center justify-content-between ${
                                isChecked ? 'bg-success-subtle border-success' : 'bg-light border-secondary-subtle opacity-60'
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-center gap-2 min-w-0">
                                <i className={`fa-solid ${f.icon} ${isChecked ? 'text-success' : 'text-muted'}`} style={{ width: '16px' }}></i>
                                <span className={`small fw-semibold text-truncate ${isChecked ? 'text-success-emphasis' : 'text-muted'}`}>
                                  {f.label}
                                </span>
                              </div>
                              <span className={`badge ${isChecked ? 'bg-success' : 'bg-secondary'}`}>
                                {isChecked ? 'ENABLED' : 'LOCKED'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger fw-bold px-4">
                    {editingTenant ? 'Save Changes' : 'Register Restaurant'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LIMITS & FEATURE TOGGLES FOR SPECIFIC TENANT */}
      {selectedTenantForLimits && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className={`modal-content border-0 shadow-lg rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="modal-header bg-dark text-white p-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <Sliders className="w-5 h-5 text-warning" />
                  <h5 className="modal-title h6 fw-bold mb-0">
                    Feature Limits & Module Authorization: {selectedTenantForLimits.name}
                  </h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTenantForLimits(null)} />
              </div>

              <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <p className="small text-muted mb-4">
                  Super Admin control to restrict or enable core features for <strong>{selectedTenantForLimits.name}</strong>. Modules marked <strong>LOCKED</strong> will be hidden and restricted across all roles for this restaurant.
                </p>

                <div className="row g-3">
                  {FEATURE_METADATA.map((f) => {
                    const isEnabled = selectedTenantForLimits.features[f.key];
                    return (
                      <div key={f.key} className="col-12 col-md-6">
                        <div className={`p-3 rounded-3 border d-flex align-items-center justify-content-between ${
                          isEnabled ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'
                        }`}>
                          <div className="d-flex align-items-center gap-2 min-w-0">
                            <i className={`fa-solid ${f.icon} ${isEnabled ? 'text-success' : 'text-danger'}`} style={{ width: '20px' }}></i>
                            <div>
                              <div className="fw-bold small">{f.label}</div>
                              <div className="text-muted text-xs">{f.desc}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              handleToggleSingleFeature(selectedTenantForLimits.id, f.key);
                              setSelectedTenantForLimits(prev => prev ? {
                                ...prev,
                                features: { ...prev.features, [f.key]: !prev.features[f.key] }
                              } : null);
                            }}
                            className={`btn btn-sm fw-bold ${isEnabled ? 'btn-success' : 'btn-outline-danger'}`}
                          >
                            {isEnabled ? 'ENABLED' : 'LOCKED'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button type="button" className="btn btn-dark fw-bold px-4" onClick={() => setSelectedTenantForLimits(null)}>
                  Close & Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
