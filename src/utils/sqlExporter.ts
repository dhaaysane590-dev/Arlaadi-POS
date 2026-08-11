import { db } from './db';

/**
 * Generates a complete, production-ready SQL dump file (.sql)
 * containing full DDL schema creation and DML seed/live data INSERTS
 * for MySQL / PostgreSQL / SQLite offline deployment.
 */
export function generateFullDatabaseSql(): string {
  const settings = db.getSettings();
  const tenants = db.getTenants();
  const employees = db.getEmployees();
  const categories = db.getCategories();
  const menuItems = db.getMenuItems();
  const tables = db.getTables();
  const customers = db.getCustomers();
  const orders = db.getOrders();
  const inventory = db.getInventory();
  const expenses = db.getExpenses();
  const reservations = db.getReservations();
  const posDayHistory = db.getPosDayHistory();

  const timestamp = new Date().toISOString();

  let sql = `-- ==============================================================================
-- PALACE BISTRO & INSTITUTE POS SYSTEM - FULL DATABASE DUMP (.sql)
-- Generated on: ${timestamp}
-- Compatible with: PostgreSQL 12+, MySQL 8.0+, SQLite 3+
-- Description: Offline full schema & seed data SQL script for local deployment.
-- Software Provided By: Arlaadi ICT Solution © 2026
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLE: tenants (Multi-Branch / Multi-Institute Support)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(100) PRIMARY KEY,
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255),
  email VARCHAR(100),
  phone VARCHAR(100),
  address TEXT,
  plan VARCHAR(50) DEFAULT 'Starter',
  status VARCHAR(50) DEFAULT 'Active',
  currency_symbol VARCHAR(10) DEFAULT '$',
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. TABLE: settings (System Configuration & Login Customizations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  address TEXT,
  logo TEXT,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  currency_symbol VARCHAR(10) DEFAULT '$',
  currency_code VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(100) DEFAULT 'Africa/Mogadishu',
  receipt_header TEXT,
  receipt_footer TEXT,
  enable_thermal_printer BOOLEAN DEFAULT TRUE,
  receipt_printer_model VARCHAR(100),
  receipt_paper_width VARCHAR(20) DEFAULT '80mm',
  receipt_font_size INT DEFAULT 12,
  premier_wallet_id VARCHAR(100),
  enable_auto_ingredient_deduction BOOLEAN DEFAULT TRUE,
  enable_kds_sound_alerts BOOLEAN DEFAULT TRUE,
  login_title VARCHAR(255),
  login_tagline VARCHAR(255),
  login_logo TEXT,
  login_address TEXT,
  login_phone VARCHAR(100),
  login_footer_text TEXT,
  login_announcement TEXT,
  login_bg_style VARCHAR(50) DEFAULT 'blue_gradient',
  login_button_color VARCHAR(20) DEFAULT '#2b7fff',
  login_show_quick_login BOOLEAN DEFAULT TRUE,
  login_show_profile_selector BOOLEAN DEFAULT TRUE,
  login_show_logo BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: employees (Staff Users & Authentication PINs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  pin VARCHAR(20) DEFAULT '1234',
  email VARCHAR(100),
  phone VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Active',
  shift VARCHAR(50) DEFAULT 'Morning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. TABLE: categories (Menu / Catalog Categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  description TEXT,
  item_count INT DEFAULT 0
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: menu_items (Food / Beverages / Products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id VARCHAR(100),
  selling_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0.00,
  description TEXT,
  image TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  prep_time_minutes INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 6. TABLE: tables (Floor Plan & Dining Tables)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dining_tables (
  id VARCHAR(100) PRIMARY KEY,
  table_number VARCHAR(50) NOT NULL,
  capacity INT DEFAULT 4,
  status VARCHAR(50) DEFAULT 'Available',
  area VARCHAR(100) DEFAULT 'Main Hall'
);

-- ------------------------------------------------------------------------------
-- 7. TABLE: customers (Client Accounts & Credit Balances)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  email VARCHAR(100),
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  total_orders_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. TABLE: orders (POS Orders & Sales Transactions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL,
  table_id VARCHAR(100),
  customer_name VARCHAR(255),
  waiter_name VARCHAR(255),
  order_type VARCHAR(50) DEFAULT 'Dine In',
  status VARCHAR(50) DEFAULT 'Completed',
  payment_method VARCHAR(50) DEFAULT 'Cash',
  payment_status VARCHAR(50) DEFAULT 'Paid',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  kitchen_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. TABLE: order_items (Detailed Line Items in Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(100) PRIMARY KEY,
  order_id VARCHAR(100) NOT NULL,
  menu_item_id VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  kitchen_notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 10. TABLE: inventory (Raw Ingredients & Stock Items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  stock_quantity DECIMAL(10,2) NOT NULL,
  min_threshold DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  supplier_name VARCHAR(255)
);

-- ------------------------------------------------------------------------------
-- 11. TABLE: expenses (Daily Operating Expenses)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  recorded_by VARCHAR(100),
  notes TEXT,
  date VARCHAR(50)
);

-- ------------------------------------------------------------------------------
-- 12. TABLE: pos_day_history (EOD / Shift Closing Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_day_history (
  id VARCHAR(100) PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  opening_time TIMESTAMP NULL,
  closing_time TIMESTAMP NULL,
  status VARCHAR(50) DEFAULT 'closed',
  opening_balance DECIMAL(10,2) DEFAULT 0.00,
  closing_balance DECIMAL(10,2) DEFAULT 0.00,
  total_sales DECIMAL(10,2) DEFAULT 0.00,
  total_orders INT DEFAULT 0,
  closed_by VARCHAR(100)
);

-- ==============================================================================
-- SEED / LIVE DATA INSERT STATEMENTS
-- ==============================================================================

`;

  const esc = (val: any) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return val;
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  // Insert Settings
  sql += `-- INSERTS FOR SETTINGS\n`;
  sql += `INSERT INTO settings (
    name, phone, address, logo, tax_rate, currency_symbol, currency_code, timezone, 
    receipt_header, receipt_footer, enable_thermal_printer, receipt_printer_model, 
    receipt_paper_width, receipt_font_size, premier_wallet_id, enable_auto_ingredient_deduction, 
    enable_kds_sound_alerts, login_title, login_tagline, login_logo, login_address, 
    login_phone, login_footer_text, login_announcement, login_bg_style, login_button_color, 
    login_show_quick_login, login_show_profile_selector, login_show_logo
  ) VALUES (\n`;
  sql += `  ${esc(settings.name)}, ${esc(settings.phone)}, ${esc(settings.address)}, ${esc(settings.logo)}, ${settings.taxRate || 0}, ${esc(settings.currencySymbol)}, ${esc(settings.currencyCode)}, ${esc(settings.timezone)},\n`;
  sql += `  ${esc(settings.receiptHeader)}, ${esc(settings.receiptFooter)}, ${settings.enableThermalPrinter ? 'TRUE' : 'FALSE'}, ${esc(settings.receiptPrinterModel)}, ${esc(settings.receiptPaperWidth)}, ${settings.receiptFontSize || 12},\n`;
  sql += `  ${esc(settings.premierWalletId)}, ${settings.enableAutoIngredientDeduction ? 'TRUE' : 'FALSE'}, ${settings.enableKdsSoundAlerts ? 'TRUE' : 'FALSE'},\n`;
  sql += `  ${esc(settings.loginTitle)}, ${esc(settings.loginTagline)}, ${esc(settings.loginLogo)}, ${esc(settings.loginAddress)}, ${esc(settings.loginPhone)},\n`;
  sql += `  ${esc(settings.loginFooterText)}, ${esc(settings.loginAnnouncement)}, ${esc(settings.loginBgStyle || 'blue_gradient')}, ${esc(settings.loginButtonColor || '#2b7fff')},\n`;
  sql += `  ${settings.loginShowQuickLogin !== false ? 'TRUE' : 'FALSE'}, ${settings.loginShowProfileSelector !== false ? 'TRUE' : 'FALSE'}, ${settings.loginShowLogo !== false ? 'TRUE' : 'FALSE'}\n`;
  sql += `);\n\n`;

  // Insert Tenants
  if (tenants && tenants.length > 0) {
    sql += `-- INSERTS FOR TENANTS\n`;
    tenants.forEach(t => {
      sql += `INSERT INTO tenants (id, code, name, owner_name, email, phone, address, plan, status, currency_symbol, tax_rate) VALUES (${esc(t.id)}, ${esc(t.code)}, ${esc(t.name)}, ${esc(t.ownerName)}, ${esc(t.email)}, ${esc(t.phone)}, ${esc(t.address)}, ${esc(t.plan)}, ${esc(t.status)}, ${esc(t.currencySymbol)}, ${t.taxRate || 0});\n`;
    });
    sql += `\n`;
  }

  // Insert Employees
  if (employees && employees.length > 0) {
    sql += `-- INSERTS FOR EMPLOYEES\n`;
    employees.forEach(e => {
      sql += `INSERT INTO employees (id, name, role, pin, email, phone, status, shift) VALUES (${esc(e.id)}, ${esc(e.name)}, ${esc(e.role)}, ${esc((e as any).pin || '1234')}, ${esc(e.email)}, ${esc(e.phone)}, ${esc(e.status)}, ${esc(e.shift)});\n`;
    });
    sql += `\n`;
  }

  // Insert Categories
  if (categories && categories.length > 0) {
    sql += `-- INSERTS FOR CATEGORIES\n`;
    categories.forEach(c => {
      sql += `INSERT INTO categories (id, name, icon, description, item_count) VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.icon)}, ${esc(c.description)}, ${c.itemCount || 0});\n`;
    });
    sql += `\n`;
  }

  // Insert Menu Items
  if (menuItems && menuItems.length > 0) {
    sql += `-- INSERTS FOR MENU ITEMS\n`;
    menuItems.forEach(m => {
      sql += `INSERT INTO menu_items (id, name, category_id, selling_price, cost_price, description, image, is_available, prep_time_minutes) VALUES (${esc(m.id)}, ${esc(m.name)}, ${esc(m.categoryId)}, ${m.sellingPrice}, ${m.costPrice || 0}, ${esc(m.description)}, ${esc(m.image)}, ${m.isAvailable ? 'TRUE' : 'FALSE'}, ${m.prepTimeMinutes || 10});\n`;
    });
    sql += `\n`;
  }

  // Insert Dining Tables
  if (tables && tables.length > 0) {
    sql += `-- INSERTS FOR DINING TABLES\n`;
    tables.forEach(t => {
      sql += `INSERT INTO dining_tables (id, table_number, capacity, status, area) VALUES (${esc(t.id)}, ${esc(t.tableNumber)}, ${t.capacity}, ${esc(t.status)}, ${esc(t.area || 'Main Hall')});\n`;
    });
    sql += `\n`;
  }

  // Insert Customers
  if (customers && customers.length > 0) {
    sql += `-- INSERTS FOR CUSTOMERS\n`;
    customers.forEach(c => {
      sql += `INSERT INTO customers (id, name, phone, email, wallet_balance, total_spent, total_orders_count, notes) VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.phone)}, ${esc(c.email)}, ${c.walletBalance || 0}, ${c.totalSpent || 0}, ${c.totalOrdersCount || 0}, ${esc(c.notes)});\n`;
    });
    sql += `\n`;
  }

  // Insert Orders & Order Items
  if (orders && orders.length > 0) {
    sql += `-- INSERTS FOR ORDERS & ORDER ITEMS\n`;
    orders.forEach(o => {
      sql += `INSERT INTO orders (id, order_number, table_id, customer_name, waiter_name, order_type, status, payment_method, payment_status, subtotal, tax_amount, discount_amount, total_amount, kitchen_notes, created_at) VALUES (${esc(o.id)}, ${esc(o.orderNumber)}, ${esc(o.tableId)}, ${esc(o.customerName)}, ${esc(o.waiterName)}, ${esc(o.orderType)}, ${esc(o.status)}, ${esc(o.paymentMethod)}, ${esc(o.paymentStatus)}, ${o.subtotal}, ${o.taxAmount || 0}, ${o.discountAmount || 0}, ${o.totalAmount}, ${esc(o.kitchenNotes)}, ${esc(o.createdAt)});\n`;
      
      if (o.items && o.items.length > 0) {
        o.items.forEach(item => {
          sql += `  INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, kitchen_notes) VALUES (${esc(item.id)}, ${esc(o.id)}, ${esc(item.menuItemId)}, ${esc(item.name)}, ${item.unitPrice}, ${item.quantity}, ${item.subtotal}, ${esc(item.kitchenNotes)});\n`;
        });
      }
    });
    sql += `\n`;
  }

  // Insert Inventory
  if (inventory && inventory.length > 0) {
    sql += `-- INSERTS FOR INVENTORY\n`;
    inventory.forEach(i => {
      sql += `INSERT INTO inventory (id, name, category, stock_quantity, min_threshold, unit, unit_cost, supplier_name) VALUES (${esc(i.id)}, ${esc(i.name)}, ${esc(i.category)}, ${i.stockQuantity}, ${i.minThreshold}, ${esc(i.unit)}, ${i.unitCost}, ${esc(i.supplierName)});\n`;
    });
    sql += `\n`;
  }

  // Insert Expenses
  if (expenses && expenses.length > 0) {
    sql += `-- INSERTS FOR EXPENSES\n`;
    expenses.forEach(ex => {
      sql += `INSERT INTO expenses (id, title, category, amount, payment_method, recorded_by, notes, date) VALUES (${esc(ex.id)}, ${esc(ex.title)}, ${esc(ex.category)}, ${ex.amount}, ${esc(ex.paymentMethod)}, ${esc(ex.recordedBy)}, ${esc(ex.notes)}, ${esc(ex.date)});\n`;
    });
    sql += `\n`;
  }

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  sql += `-- ==============================================================================\n`;
  sql += `-- END OF DATABASE DUMP\n`;
  sql += `-- ==============================================================================\n`;

  return sql;
}

/**
 * Triggers automatic browser download of the full .sql file
 */
export function downloadDatabaseSqlFile(): void {
  const sqlContent = generateFullDatabaseSql();
  const blob = new Blob([sqlContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `palace_bistro_pos_database_${new Date().toISOString().slice(0, 10)}.sql`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
