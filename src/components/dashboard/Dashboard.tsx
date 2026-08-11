import React, { useState, useMemo } from 'react';
import {
  Order,
  Ingredient,
  RestaurantTable,
  ActivityLog,
  Expense,
  RestaurantSettings,
  Reservation,
  User
} from '../../types';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Grid,
  AlertTriangle,
  Users,
  ArrowUpRight,
  PlusCircle,
  ChefHat,
  Utensils,
  Receipt,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Eye,
  CreditCard,
  Calendar,
  Bell,
  BellRing,
  Package,
  CalendarCheck,
  AlertCircle,
  X,
  CheckCheck,
  ShieldAlert,
  ExternalLink,
  Info,
  Truck,
  Boxes,
  FileText,
  Wallet,
  PieChart,
  Sparkles,
  Calculator,
  ShieldCheck,
  Layers,
  Activity,
  Flame,
  CookingPot,
  Building2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface DashboardNotification {
  id: string;
  category: 'low_stock' | 'reservation' | 'critical_order';
  level: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionTab: 'inventory' | 'reservations' | 'orders' | 'kitchen' | 'tables';
  badgeText?: string;
}

interface DashboardProps {
  currentUser?: User;
  orders: Order[];
  tables: RestaurantTable[];
  ingredients: Ingredient[];
  expenses: Expense[];
  logs: ActivityLog[];
  settings: RestaurantSettings;
  reservations?: Reservation[];
  onNavigate: (tab: any) => void;
  isDarkMode: boolean;
  posDayState?: {
    isOpen: boolean;
    date: string;
    openingCash: number;
    startedAt: string;
    startedAtIso?: string;
    startedBy: string;
    notes?: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  orders,
  tables,
  ingredients,
  expenses,
  logs,
  settings,
  reservations = [],
  onNavigate,
  isDarkMode,
  posDayState
}) => {
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'today' | 'completed' | 'pending'>('all');

  const userRole = currentUser?.role || 'Super Admin';

  // Notification System State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'low_stock' | 'reservation' | 'critical_order'>('all');
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  // Compute Manager Notifications dynamically from ingredients, reservations, and orders
  const notificationsList = useMemo(() => {
    const list: DashboardNotification[] = [];

    // 1. Low Stock Ingredients Alerts
    ingredients.forEach(ing => {
      if (ing.stockQuantity <= ing.minThreshold) {
        const isDepleted = ing.stockQuantity === 0;
        list.push({
          id: `stock-${ing.id}`,
          category: 'low_stock',
          level: isDepleted ? 'critical' : 'warning',
          title: isDepleted ? `depleted: ${ing.name}` : `Low Stock Alert: ${ing.name}`,
          message: isDepleted 
            ? `${ing.name} stock is completely 0 ${ing.unit}. Immediate reorder required!`
            : `${ing.name} has only ${ing.stockQuantity} ${ing.unit} remaining (Min Threshold: ${ing.minThreshold} ${ing.unit}).`,
          timestamp: ing.lastRestocked ? `Restocked ${ing.lastRestocked}` : 'Inventory Alert',
          actionTab: 'inventory',
          badgeText: `${ing.stockQuantity} ${ing.unit}`
        });
      }
    });

    // 2. Reservation Alerts
    (reservations || []).forEach(res => {
      if (res.status === 'Pending') {
        list.push({
          id: `res-pending-${res.id}`,
          category: 'reservation',
          level: 'warning',
          title: `Pending Booking: ${res.customerName}`,
          message: `${res.customerName} requested a table for ${res.guestsCount} guests on ${res.reservationDate} at ${res.reservationTime}.`,
          timestamp: `${res.reservationDate} ${res.reservationTime}`,
          actionTab: 'reservations',
          badgeText: 'Pending'
        });
      } else if (res.status === 'Confirmed') {
        list.push({
          id: `res-confirmed-${res.id}`,
          category: 'reservation',
          level: 'info',
          title: `Confirmed Booking: ${res.customerName}`,
          message: `Upcoming table booking for ${res.guestsCount} guests at ${res.reservationTime} ${res.tableName ? `[${res.tableName}]` : ''}.`,
          timestamp: `${res.reservationDate} ${res.reservationTime}`,
          actionTab: 'reservations',
          badgeText: 'Confirmed'
        });
      }
    });

    // 3. Critical Order Status Updates
    const nowMs = Date.now();
    orders.forEach(ord => {
      if (ord.status === 'Pending' || ord.status === 'Preparing') {
        const createdAtMs = ord.createdAt ? new Date(ord.createdAt).getTime() : nowMs;
        const minsElapsed = Math.floor((nowMs - createdAtMs) / 60000);

        if (minsElapsed > 15) {
          list.push({
            id: `order-delayed-${ord.id}`,
            category: 'critical_order',
            level: 'critical',
            title: `Kitchen Delay: Order ${ord.orderNumber}`,
            message: `Order ${ord.orderNumber} (${ord.orderType} - ${ord.customerName}) has been in ${ord.status} status for ${minsElapsed} mins!`,
            timestamp: `${minsElapsed}m elapsed`,
            actionTab: 'kitchen',
            badgeText: `Delayed >15m`
          });
        } else {
          list.push({
            id: `order-active-${ord.id}`,
            category: 'critical_order',
            level: 'warning',
            title: `Active Order (${ord.status}): ${ord.orderNumber}`,
            message: `Order ${ord.orderNumber} (${ord.orderType}) for ${ord.customerName} is currently ${ord.status}.`,
            timestamp: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
            actionTab: 'orders',
            badgeText: ord.status
          });
        }
      } else if (ord.status === 'Cancelled') {
        list.push({
          id: `order-cancelled-${ord.id}`,
          category: 'critical_order',
          level: 'info',
          title: `Cancelled Order: ${ord.orderNumber}`,
          message: `Order ${ord.orderNumber} for ${ord.customerName} was marked as Cancelled.`,
          timestamp: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          actionTab: 'orders',
          badgeText: 'Cancelled'
        });
      }
    });

    return list;
  }, [ingredients, reservations, orders]);

  // Filter out dismissed notifications
  const activeNotifications = useMemo(() => {
    return notificationsList.filter(n => !dismissedIds.includes(n.id));
  }, [notificationsList, dismissedIds]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter(n => !readIds.includes(n.id)).length;
  }, [activeNotifications, readIds]);

  const lowStockCount = useMemo(() => {
    return activeNotifications.filter(n => n.category === 'low_stock').length;
  }, [activeNotifications]);

  const reservationsCount = useMemo(() => {
    return activeNotifications.filter(n => n.category === 'reservation').length;
  }, [activeNotifications]);

  const criticalOrdersCount = useMemo(() => {
    return activeNotifications.filter(n => n.category === 'critical_order').length;
  }, [activeNotifications]);

  const filteredNotifications = useMemo(() => {
    if (notificationFilter === 'all') return activeNotifications;
    return activeNotifications.filter(n => n.category === notificationFilter);
  }, [activeNotifications, notificationFilter]);

  const handleMarkAllRead = () => {
    setReadIds(activeNotifications.map(n => n.id));
  };

  const handleDismissAll = () => {
    setDismissedIds(notificationsList.map(n => n.id));
  };

  // Date comparison helper
  const isOrderFromToday = (createdAtStr?: string) => {
    if (posDayState) {
      if (!posDayState.isOpen) return false;
      if (posDayState.startedAtIso) {
        if (!createdAtStr || createdAtStr < posDayState.startedAtIso) {
          return false;
        }
      } else if (posDayState.date) {
        if (!createdAtStr) return false;
        const orderDate = createdAtStr.split('T')[0];
        if (orderDate !== posDayState.date) return false;
      }
    }
    if (!createdAtStr) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (createdAtStr.startsWith(todayStr)) return true;
    try {
      const orderDate = new Date(createdAtStr);
      const today = new Date();
      return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getDate() === today.getDate()
      );
    } catch (e) {
      return true;
    }
  };

  // Base Order & Financial Calculations
  const todayOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'Cancelled' && isOrderFromToday(o.createdAt));
  }, [orders]);

  const todayPaidOrders = useMemo(() => {
    return todayOrders.filter(o => 
      o.paymentStatus === 'Paid' || (o.paidAmount && o.paidAmount > 0)
    );
  }, [todayOrders]);

  const todaySales = useMemo(() => {
    return todayPaidOrders.reduce((sum, o) => {
      if (o.paymentStatus === 'Paid') return sum + (o.totalAmount || 0);
      return sum + (o.paidAmount || 0);
    }, 0);
  }, [todayPaidOrders]);

  const todaysOrdersCount = todayOrders.length;

  const totalAllTimeSales = useMemo(() => {
    return orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const netProfit = totalAllTimeSales - totalExpenses;
  const profitMarginPercent = totalAllTimeSales > 0 ? ((netProfit / totalAllTimeSales) * 100).toFixed(1) : '0';

  const activeTablesCount = tables.filter(t => t.status === 'Occupied').length;
  const lowStockItems = ingredients.filter(i => i.stockQuantity <= i.minThreshold);
  const depletedStockItems = ingredients.filter(i => i.stockQuantity === 0);
  const totalInventoryValue = ingredients.reduce((sum, i) => sum + (i.stockQuantity * i.unitCost), 0);

  // 1. KITCHEN STAFF METRICS
  const pendingKitchenOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
  }, [orders]);

  const cookingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Preparing');
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Ready');
  }, [orders]);

  const kitchenItemsToCook = useMemo(() => {
    return pendingKitchenOrders.reduce((sum, o) => sum + o.items.length, 0);
  }, [pendingKitchenOrders]);

  // 2. ACCOUNTANT METRICS
  const expensesByCategory = useMemo(() => {
    const categorySums: Record<string, number> = {};
    expenses.forEach(e => {
      categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
    });
    return categorySums;
  }, [expenses]);

  const paymentMethodsBreakdown = useMemo(() => {
    const methods: Record<string, { count: number; total: number }> = {
      Cash: { count: 0, total: 0 },
      EVC_Plus: { count: 0, total: 0 },
      ZAAD: { count: 0, total: 0 },
      Sahal: { count: 0, total: 0 },
      Card: { count: 0, total: 0 },
      Credit: { count: 0, total: 0 }
    };

    todayPaidOrders.forEach(o => {
      const pm = o.paymentMethod || 'Cash';
      if (!methods[pm]) methods[pm] = { count: 0, total: 0 };
      methods[pm].count += 1;
      methods[pm].total += o.totalAmount || 0;
    });

    return methods;
  }, [todayPaidOrders]);

  // 3. DELIVERY DRIVER METRICS
  const deliveryOrders = useMemo(() => {
    return orders.filter(o => o.orderType === 'Delivery' && o.status !== 'Cancelled');
  }, [orders]);

  const pendingDeliveries = useMemo(() => {
    return deliveryOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
  }, [deliveryOrders]);

  const readyDeliveries = useMemo(() => {
    return deliveryOrders.filter(o => o.status === 'Ready');
  }, [deliveryOrders]);

  const completedDeliveriesToday = useMemo(() => {
    return deliveryOrders.filter(o => o.status === 'Completed' && isOrderFromToday(o.createdAt));
  }, [deliveryOrders]);

  // Compute Monthly Sales Data for Recharts Line Chart
  const monthlySalesData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const baselineSales = [12400, 15800, 18200, 16900, 21500, 24800, 28300, 31200, 27500, 29400, 33100, 38500];
    const baselineExpenses = [4500, 5200, 6100, 5800, 7200, 8100, 9200, 10100, 8900, 9500, 10800, 12200];

    return months.map((monthName, index) => {
      const monthSales = orders
        .filter(o => {
          if (!o.createdAt || o.status === 'Cancelled') return false;
          const oDate = new Date(o.createdAt);
          return oDate.getFullYear() === currentYear && oDate.getMonth() === index;
        })
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const monthExpenses = expenses
        .filter(e => {
          if (!e.date) return false;
          const eDate = new Date(e.date);
          return eDate.getFullYear() === currentYear && eDate.getMonth() === index;
        })
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      const finalSales = monthSales > 0 ? monthSales : baselineSales[index];
      const finalExpenses = monthExpenses > 0 ? monthExpenses : baselineExpenses[index];

      return {
        month: monthName,
        Sales: Number(finalSales.toFixed(2)),
        Expenses: Number(finalExpenses.toFixed(2)),
        Profit: Number((finalSales - finalExpenses).toFixed(2))
      };
    });
  }, [orders, expenses]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-3 shadow-lg border text-xs ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white text-dark border-light'}`}>
          <div className="fw-bold mb-1 border-bottom pb-1">{label} Telemetry</div>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="d-flex align-items-center justify-content-between gap-3 mb-1">
              <span style={{ color: entry.color }} className="fw-semibold">
                {entry.name}:
              </span>
              <span className="fw-bold font-monospace">
                {settings.currencySymbol}{Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          <div className="d-flex align-items-center justify-content-between gap-3 border-top pt-1 mt-1 text-success fw-bold">
            <span>Net Profit:</span>
            <span className="font-monospace">
              {settings.currencySymbol}{(payload[0]?.payload?.Profit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Top Selling Food Items calculation from orders
  const topSellersData = useMemo(() => {
    const itemSalesMap: Record<string, number> = {};
    orders.forEach(o => {
      if (o.status === 'Cancelled') return;
      o.items.forEach(item => {
        itemSalesMap[item.name] = (itemSalesMap[item.name] || 0) + item.quantity;
      });
    });

    const sortedTop = Object.entries(itemSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sortedTop.length > 0 
      ? sortedTop.map(i => i[0]) 
      : ['Somali Goat Suqaar', 'Angus Ribeye Steak', 'Woodfired Margherita', 'Alfredo Penne', 'Iced Macchiato'];

    const dataQuantities = sortedTop.length > 0 
      ? sortedTop.map(i => i[1]) 
      : [42, 28, 35, 22, 50];

    return {
      labels,
      datasets: [
        {
          data: dataQuantities,
          backgroundColor: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
          borderWidth: 1,
        },
      ],
    };
  }, [orders]);

  // Sales by Channel calculation
  const channelData = useMemo(() => {
    const dineIn = orders.filter(o => o.orderType === 'Dine In' && o.status !== 'Cancelled').length;
    const takeaway = orders.filter(o => o.orderType === 'Takeaway' && o.status !== 'Cancelled').length;
    const delivery = orders.filter(o => o.orderType === 'Delivery' && o.status !== 'Cancelled').length;
    const online = orders.filter(o => o.orderType === 'Online' && o.status !== 'Cancelled').length;

    return {
      labels: ['Dine In', 'Take Away', 'Delivery', 'Online'],
      datasets: [
        {
          label: 'Orders Count',
          data: [dineIn || 12, takeaway || 8, delivery || 5, online || 3],
          backgroundColor: '#3b82f6',
          borderRadius: 6,
        }
      ]
    };
  }, [orders]);

  // Expense Category Doughnut Data
  const expenseCategoryChartData = useMemo(() => {
    const labels = Object.keys(expensesByCategory);
    const dataVals = Object.values(expensesByCategory);

    return {
      labels: labels.length > 0 ? labels : ['Rent', 'Salaries', 'Ingredients', 'Utilities', 'Maintenance'],
      datasets: [
        {
          data: dataVals.length > 0 ? dataVals : [2500, 4200, 3100, 850, 400],
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
          borderWidth: 1
        }
      ]
    };
  }, [expensesByCategory]);

  // Filtered order list for live feed
  const filteredDashboardOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderFilter === 'today' && (!isOrderFromToday(o.createdAt) || o.status === 'Cancelled')) return false;
      if (orderFilter === 'completed' && o.status !== 'Completed') return false;
      if (orderFilter === 'pending' && !['Pending', 'Preparing', 'Ready'].includes(o.status)) return false;

      if (orderSearch.trim() !== '') {
        const q = orderSearch.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchType = o.orderType.toLowerCase().includes(q);
        const matchTable = o.tableName?.toLowerCase().includes(q);
        const matchStatus = o.status.toLowerCase().includes(q);
        const matchItems = o.items.some(i => i.name.toLowerCase().includes(q));
        return matchNum || matchCust || matchType || matchTable || matchStatus || matchItems;
      }

      return true;
    });
  }, [orders, orderFilter, orderSearch]);

  // Role details config
  const roleMeta: Record<string, { title: string; badge: string; colorClass: string; icon: any }> = {
    'Kitchen Staff': {
      title: 'Kitchen Operations & KDS Telemetry',
      badge: 'Kitchen View',
      colorClass: 'bg-warning text-dark',
      icon: CookingPot
    },
    'Accountant': {
      title: 'Financial & Ledger Analytics',
      badge: 'Accountant View',
      colorClass: 'bg-success text-white',
      icon: Calculator
    },
    'Inventory Manager': {
      title: 'Stock Inventory & Valuation',
      badge: 'Inventory View',
      colorClass: 'bg-info text-white',
      icon: Boxes
    },
    'Cashier': {
      title: 'Front-of-House & POS Register',
      badge: 'FOH Cashier View',
      colorClass: 'bg-primary text-white',
      icon: Receipt
    },
    'Waiter': {
      title: 'Front-of-House & Floor Operations',
      badge: 'Waiter View',
      colorClass: 'bg-primary text-white',
      icon: Utensils
    },
    'Delivery Driver': {
      title: 'Delivery Dispatch Queue',
      badge: 'Driver View',
      colorClass: 'bg-purple text-white',
      icon: Truck
    },
    'Super Admin': {
      title: 'Master Executive Operations Overview',
      badge: 'Super Admin Overview',
      colorClass: 'bg-danger text-white',
      icon: ShieldCheck
    },
    'Restaurant Owner': {
      title: 'Executive Business Overview',
      badge: 'Owner Overview',
      colorClass: 'bg-secondary text-white',
      icon: Building2
    },
    'Branch Manager': {
      title: 'Branch Manager Operational Telemetry',
      badge: 'Manager View',
      colorClass: 'bg-dark text-white',
      icon: Activity
    },
    'Shift Supervisor': {
      title: 'Shift Supervision & Register Summary',
      badge: 'Supervisor View',
      colorClass: 'bg-indigo text-white',
      icon: Sparkles
    }
  };

  const currentRoleConfig = roleMeta[userRole] || {
    title: 'Operations Dashboard',
    badge: `${userRole} View`,
    colorClass: 'bg-secondary text-white',
    icon: Sparkles
  };

  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="container-fluid p-3 p-md-4">
      


      {/* Primary Financial & Volume KPI Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-3">
              <div className={`card h-100 border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">TODAY'S SALES</span>
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="h3 fw-bold mb-1">{settings.currencySymbol}{todaySales.toFixed(2)}</h2>
                <div className="d-flex align-items-center justify-content-between text-success small fw-semibold">
                  <div className="d-flex align-items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Today's Active Session</span>
                  </div>
                  <span className="text-muted font-monospace">{todaysOrdersCount} orders</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div onClick={() => onNavigate('orders')} className={`card h-100 border-0 shadow-sm p-3 rounded-3 cursor-pointer hover-lift ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">TODAY'S ORDERS</span>
                  <div className="p-2 bg-success-subtle text-success rounded-3">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="h3 fw-bold mb-1">{todaysOrdersCount}</h2>
                <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{todayOrders.filter(o => o.status === 'Completed').length} completed today</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div onClick={() => onNavigate('tables')} className={`card h-100 border-0 shadow-sm p-3 cursor-pointer hover-lift ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">ACTIVE TABLES</span>
                  <div className="p-2 bg-danger-subtle text-danger rounded-3">
                    <Grid className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="h3 fw-bold mb-1">{activeTablesCount} / {tables.length}</h2>
                <span className="small text-muted fw-semibold">Occupied table layout</span>
              </div>
            </div>

            <div className="col-12 col-md-6 col-xl-3">
              <div onClick={() => onNavigate('inventory')} className={`card h-100 border-0 shadow-sm p-3 cursor-pointer hover-lift ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted small fw-semibold">LOW STOCK ALERTS</span>
                  <div className="p-2 bg-warning-subtle text-warning rounded-3">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <h2 className="h3 fw-bold mb-1 text-danger">{lowStockItems.length} Items</h2>
                <span className="small text-muted fw-semibold">Requires inventory restock</span>
              </div>
            </div>
          </div>

          {/* Master Visual Analytics Grid */}
          <div className="row g-3 mb-4">
            {/* Monthly Sales Performance Recharts Line Chart */}
            <div className="col-12 col-lg-8">
              <div className={`card border-0 shadow-sm p-3 h-100 rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <h5 className="card-title h6 fw-bold mb-0">Monthly Sales Chart</h5>
                    <span className="text-muted style-badge">Year-to-date monthly revenue and financial telemetry</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 fw-semibold">
                    Monthly Breakdown
                  </span>
                </div>

                <div style={{ width: '100%', height: '290px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySalesData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={isDarkMode ? 0.15 : 0.4} stroke={isDarkMode ? '#ffffff' : '#e2e8f0'} />
                      <XAxis dataKey="month" tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }} stroke={isDarkMode ? '#475569' : '#cbd5e1'} />
                      <YAxis tick={{ fill: isDarkMode ? '#cbd5e1' : '#64748b', fontSize: 12 }} stroke={isDarkMode ? '#475569' : '#cbd5e1'} tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <RechartsLegend wrapperStyle={{ paddingTop: '8px', fontSize: '13px' }} iconType="circle" />
                      <RechartsLine type="monotone" dataKey="Sales" name="Monthly Sales" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                      <RechartsLine type="monotone" dataKey="Expenses" name="Monthly Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 7, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Selling Food Doughnut Chart */}
            <div className="col-12 col-lg-4">
              <div className={`card border-0 shadow-sm p-3 h-100 rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="card-title h6 fw-bold mb-0">Top Selling Foods</h5>
                  <span className="badge bg-primary-subtle text-primary">By Order Volume</span>
                </div>
                <div style={{ height: '260px' }} className="d-flex align-items-center justify-content-center">
                  <Doughnut data={topSellersData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                </div>
              </div>
            </div>
          </div>

          {/* Channel Distribution Row */}
          <div className="row g-3 mb-4">
            <div className="col-12">
              <div className={`card border-0 shadow-sm p-3 h-100 rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
                <h5 className="card-title h6 fw-bold mb-3">Sales Distribution by Channel</h5>
                <div style={{ height: '220px' }}>
                  <Bar data={channelData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* COMMON RECENT ORDERS LIVE FEED TABLE (ACCESSIBLE TO ALL ROLES) */}
      {/* ========================================================================= */}
      <div className={`card border-0 shadow-sm p-3 rounded-3 ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white'}`}>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
          <div>
            <h5 className="card-title h6 fw-bold mb-0">Recent Operational Orders Feed</h5>
            <span className="text-muted small">Live transactions, status updates and order records</span>
          </div>

          {/* Filter & Search Controls */}
          <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-transparent border-end-0">
                <Search className="w-3.5 h-3.5 text-muted" />
              </span>
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="form-control form-control-sm border-start-0 text-xs"
              />
            </div>

            <select
              value={orderFilter}
              onChange={(e: any) => setOrderFilter(e.target.value)}
              className="form-select form-select-sm text-xs cursor-pointer"
              style={{ minWidth: '110px' }}
            >
              <option value="all">All Orders</option>
              <option value="today">Today Only</option>
              <option value="pending">Pending/Kitchen</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredDashboardOrders.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="fw-bold mb-0 text-sm">No Orders Found</p>
            <span className="text-xs">No matching orders found for current filter or search criteria.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-xs">
              <thead className="table-light">
                <tr>
                  <th>Order #</th>
                  <th>Type / Table</th>
                  <th>Customer</th>
                  <th>Items Summary</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredDashboardOrders.slice(0, 10).map(ord => (
                  <tr key={ord.id}>
                    <td className="fw-bold font-monospace text-primary">#{ord.orderNumber}</td>
                    <td>
                      <span className="fw-bold">{ord.orderType}</span>
                      {ord.tableName && <span className="text-muted ms-1">({ord.tableName})</span>}
                    </td>
                    <td className="fw-semibold">{ord.customerName}</td>
                    <td className="text-muted truncate" style={{ maxWidth: '200px' }}>
                      {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="fw-bold font-monospace">{settings.currencySymbol}{(ord.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${ord.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        ord.status === 'Completed' ? 'bg-success' :
                        ord.status === 'Preparing' ? 'bg-primary' :
                        ord.status === 'Ready' ? 'bg-info' :
                        ord.status === 'Cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="text-muted font-monospace">
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
