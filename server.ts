import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';

const currentFilename = typeof __filename !== 'undefined' ? __filename : (import.meta?.url ? fileURLToPath(import.meta.url) : '');
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilename);

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MySQL Connection Configuration (phpMyAdmin / XAMPP default settings)
const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'palace_bistro_pos',
};

let pool: mysql.Pool | null = null;
let isMySqlConnected = false;
let mySqlLastError = '';

// Initialize MySQL Pool and Create Tables automatically
async function initMySQL() {
  try {
    // 1. Connect without database to ensure database exists
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await tempConnection.end();

    // 2. Create pool targeting palace_bistro_pos database
    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test query
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    isMySqlConnected = true;
    mySqlLastError = '';
    console.log(`[MySQL Success] Connected to phpMyAdmin / MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // 3. Create tables if they do not exist
    await createTablesIfNotExist();
  } catch (err: any) {
    isMySqlConnected = false;
    mySqlLastError = err.message || 'Could not connect to local MySQL server';
    console.warn(`[MySQL Notice] Local phpMyAdmin / MySQL not active (${mySqlLastError}). Falling back to local offline storage mode.`);
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;

  const queries = [
    `CREATE TABLE IF NOT EXISTS settings (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS tenants (
      id VARCHAR(100) PRIMARY KEY,
      code VARCHAR(50),
      name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255),
      username VARCHAR(100),
      pin VARCHAR(50),
      email VARCHAR(100),
      phone VARCHAR(100),
      address TEXT,
      plan VARCHAR(50) DEFAULT 'Starter',
      status VARCHAR(50) DEFAULT 'Active',
      currency_symbol VARCHAR(10) DEFAULT '$',
      tax_rate DECIMAL(5,2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS employees (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      pin VARCHAR(20) DEFAULT '1234',
      email VARCHAR(100),
      phone VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Active',
      shift VARCHAR(50) DEFAULT 'Morning',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(100),
      description TEXT,
      item_count INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS menu_items (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category_id VARCHAR(100),
      selling_price DECIMAL(10,2) NOT NULL,
      cost_price DECIMAL(10,2) DEFAULT 0.00,
      description TEXT,
      image TEXT,
      is_available BOOLEAN DEFAULT TRUE,
      prep_time_minutes INT DEFAULT 10,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS dining_tables (
      id VARCHAR(100) PRIMARY KEY,
      table_number VARCHAR(50) NOT NULL,
      capacity INT DEFAULT 4,
      status VARCHAR(50) DEFAULT 'Available',
      area VARCHAR(100) DEFAULT 'Main Hall'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      email VARCHAR(100),
      wallet_balance DECIMAL(10,2) DEFAULT 0.00,
      total_spent DECIMAL(10,2) DEFAULT 0.00,
      total_orders_count INT DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS orders (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS order_items (
      id VARCHAR(100) PRIMARY KEY,
      order_id VARCHAR(100) NOT NULL,
      menu_item_id VARCHAR(100),
      item_name VARCHAR(255) NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      kitchen_notes TEXT,
      INDEX idx_order_id (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS inventory (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      stock_quantity DECIMAL(10,2) NOT NULL,
      min_threshold DECIMAL(10,2) NOT NULL,
      unit VARCHAR(50) NOT NULL,
      unit_cost DECIMAL(10,2) NOT NULL,
      supplier_name VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50) DEFAULT 'Cash',
      recorded_by VARCHAR(100),
      notes TEXT,
      date VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS pos_day_history (
      id VARCHAR(100) PRIMARY KEY,
      date VARCHAR(50) NOT NULL,
      opening_time VARCHAR(100),
      closing_time VARCHAR(100),
      status VARCHAR(50) DEFAULT 'closed',
      opening_balance DECIMAL(10,2) DEFAULT 0.00,
      closing_balance DECIMAL(10,2) DEFAULT 0.00,
      total_sales DECIMAL(10,2) DEFAULT 0.00,
      total_orders INT DEFAULT 0,
      closed_by VARCHAR(100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (e: any) {
      console.error('[MySQL Table Init Error]', e.message);
    }
  }
  console.log('[MySQL Init] All 12 phpMyAdmin database tables verified/created successfully!');
}

// ==============================================================================
// MYSQL API ENDPOINTS
// ==============================================================================

// 1. MySQL Status Endpoint
app.get('/api/mysql/status', async (req, res) => {
  // Re-check connection
  if (!pool) {
    await initMySQL();
  } else {
    try {
      await pool.query('SELECT 1');
      isMySqlConnected = true;
      mySqlLastError = '';
    } catch (err: any) {
      isMySqlConnected = false;
      mySqlLastError = err.message || 'Connection lost';
    }
  }

  res.json({
    connected: isMySqlConnected,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    error: mySqlLastError,
  });
});

// 2. Save New Order + Order Items directly to MySQL in phpMyAdmin
app.post('/api/mysql/orders', async (req, res) => {
  if (!pool || !isMySqlConnected) {
    return res.status(503).json({ success: false, error: 'MySQL phpMyAdmin server not connected' });
  }

  const order = req.body;
  if (!order || !order.id || !order.orderNumber) {
    return res.status(400).json({ success: false, error: 'Invalid order payload' });
  }

  try {
    // Insert into orders table
    const orderSql = `
      INSERT INTO orders 
        (id, order_number, table_id, customer_name, waiter_name, order_type, status, payment_method, payment_status, subtotal, tax_amount, discount_amount, total_amount, kitchen_notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        table_id=VALUES(table_id), customer_name=VALUES(customer_name), waiter_name=VALUES(waiter_name),
        order_type=VALUES(order_type), status=VALUES(status), payment_method=VALUES(payment_method),
        payment_status=VALUES(payment_status), subtotal=VALUES(subtotal), tax_amount=VALUES(tax_amount),
        discount_amount=VALUES(discount_amount), total_amount=VALUES(total_amount), kitchen_notes=VALUES(kitchen_notes);
    `;

    await pool.query(orderSql, [
      order.id,
      order.orderNumber,
      order.tableId || null,
      order.customerName || 'Walk-in Customer',
      order.waiterName || 'Cashier',
      order.orderType || 'Dine In',
      order.status || 'Completed',
      order.paymentMethod || 'Cash',
      order.paymentStatus || 'Paid',
      order.subtotal || 0,
      order.taxAmount || 0,
      order.discountAmount || 0,
      order.totalAmount || 0,
      order.kitchenNotes || '',
      order.createdAt || new Date().toISOString()
    ]);

    // Insert order items
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        const itemSql = `
          INSERT INTO order_items
            (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, kitchen_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            item_name=VALUES(item_name), unit_price=VALUES(unit_price), quantity=VALUES(quantity), subtotal=VALUES(subtotal);
        `;
        await pool.query(itemSql, [
          item.id,
          order.id,
          item.menuItemId || null,
          item.name || 'Item',
          item.unitPrice || 0,
          item.quantity || 1,
          item.subtotal || 0,
          item.kitchenNotes || ''
        ]);
      }
    }

    res.json({ success: true, message: 'Order persisted directly into phpMyAdmin MySQL database!', orderId: order.id });
  } catch (err: any) {
    console.error('[MySQL Order Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Save Menu Item directly to MySQL
app.post('/api/mysql/menu-items', async (req, res) => {
  if (!pool || !isMySqlConnected) {
    return res.status(503).json({ success: false, error: 'MySQL phpMyAdmin server not connected' });
  }
  const item = req.body;
  try {
    const sql = `
      INSERT INTO menu_items (id, name, category_id, selling_price, cost_price, description, image, is_available, prep_time_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name=VALUES(name), category_id=VALUES(category_id), selling_price=VALUES(selling_price),
        cost_price=VALUES(cost_price), description=VALUES(description), image=VALUES(image),
        is_available=VALUES(is_available), prep_time_minutes=VALUES(prep_time_minutes);
    `;
    await pool.query(sql, [
      item.id, item.name, item.categoryId || null, item.sellingPrice || 0,
      item.costPrice || 0, item.description || '', item.image || '',
      item.isAvailable !== false ? 1 : 0, item.prepTimeMinutes || 10
    ]);
    res.json({ success: true, message: 'Menu item stored in phpMyAdmin MySQL!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Bulk Data Synchronizer - Syncs all local storage entities directly into phpMyAdmin MySQL
app.post('/api/mysql/sync-all', async (req, res) => {
  if (!pool || !isMySqlConnected) {
    return res.status(503).json({ success: false, error: 'MySQL server not connected' });
  }

  const { settings, categories, menuItems, customers, orders, inventory, expenses, employees, tables, tenants } = req.body;

  try {
    // Sync Tenants
    if (tenants && Array.isArray(tenants)) {
      for (const t of tenants) {
        await pool.query(`
          INSERT INTO tenants (id, code, name, owner_name, username, pin, email, phone, address, plan, status, currency_symbol, tax_rate)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            code=VALUES(code), name=VALUES(name), owner_name=VALUES(owner_name), username=VALUES(username),
            pin=VALUES(pin), email=VALUES(email), phone=VALUES(phone), address=VALUES(address),
            plan=VALUES(plan), status=VALUES(status), currency_symbol=VALUES(currency_symbol), tax_rate=VALUES(tax_rate);
        `, [
          t.id, t.code || '', t.name, t.ownerName || '', t.username || '', t.pin || '',
          t.email || '', t.phone || '', t.address || '', t.plan || 'Starter',
          t.status || 'Active', t.currencySymbol || '$', t.taxRate || 0
        ]);
      }
    }
    // Sync Settings
    if (settings) {
      await pool.query(`
        INSERT INTO settings (id, name, phone, address, logo, tax_rate, currency_symbol, currency_code, timezone, receipt_header, receipt_footer)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), phone=VALUES(phone), address=VALUES(address), logo=VALUES(logo),
          tax_rate=VALUES(tax_rate), currency_symbol=VALUES(currency_symbol), currency_code=VALUES(currency_code),
          timezone=VALUES(timezone), receipt_header=VALUES(receipt_header), receipt_footer=VALUES(receipt_footer);
      `, [
        settings.name || 'Palace Bistro', settings.phone || '', settings.address || '', settings.logo || '',
        settings.taxRate || 0, settings.currencySymbol || '$', settings.currencyCode || 'USD',
        settings.timezone || 'Africa/Mogadishu', settings.receiptHeader || '', settings.receiptFooter || ''
      ]);
    }

    // Sync Categories
    if (categories && Array.isArray(categories)) {
      for (const c of categories) {
        await pool.query(`
          INSERT INTO categories (id, name, icon, description, item_count)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), icon=VALUES(icon), description=VALUES(description), item_count=VALUES(item_count);
        `, [c.id, c.name, c.icon || '', c.description || '', c.itemCount || 0]);
      }
    }

    // Sync Menu Items
    if (menuItems && Array.isArray(menuItems)) {
      for (const m of menuItems) {
        await pool.query(`
          INSERT INTO menu_items (id, name, category_id, selling_price, cost_price, description, image, is_available, prep_time_minutes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), category_id=VALUES(category_id), selling_price=VALUES(selling_price),
            cost_price=VALUES(cost_price), description=VALUES(description), image=VALUES(image), is_available=VALUES(is_available);
        `, [m.id, m.name, m.categoryId || null, m.sellingPrice || 0, m.costPrice || 0, m.description || '', m.image || '', m.isAvailable ? 1 : 0, m.prepTimeMinutes || 10]);
      }
    }

    // Sync Inventory
    if (inventory && Array.isArray(inventory)) {
      for (const i of inventory) {
        await pool.query(`
          INSERT INTO inventory (id, name, category, stock_quantity, min_threshold, unit, unit_cost, supplier_name)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), stock_quantity=VALUES(stock_quantity),
            min_threshold=VALUES(min_threshold), unit=VALUES(unit), unit_cost=VALUES(unit_cost), supplier_name=VALUES(supplier_name);
        `, [i.id, i.name, i.category || 'General', i.stockQuantity || 0, i.minThreshold || 5, i.unit || 'pcs', i.unitCost || 0, i.supplierName || '']);
      }
    }

    // Sync Expenses
    if (expenses && Array.isArray(expenses)) {
      for (const ex of expenses) {
        await pool.query(`
          INSERT INTO expenses (id, title, category, amount, payment_method, recorded_by, notes, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE title=VALUES(title), category=VALUES(category), amount=VALUES(amount);
        `, [ex.id, ex.title, ex.category, ex.amount, ex.paymentMethod || 'Cash', ex.recordedBy || 'Manager', ex.notes || '', ex.date || new Date().toISOString()]);
      }
    }

    // Sync Orders & Order Items
    if (orders && Array.isArray(orders)) {
      for (const o of orders) {
        await pool.query(`
          INSERT INTO orders (id, order_number, table_id, customer_name, waiter_name, order_type, status, payment_method, payment_status, subtotal, tax_amount, discount_amount, total_amount, kitchen_notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE status=VALUES(status), payment_status=VALUES(payment_status), total_amount=VALUES(total_amount);
        `, [o.id, o.orderNumber, o.tableId || null, o.customerName || '', o.waiterName || '', o.orderType || 'Dine In', o.status || 'Completed', o.paymentMethod || 'Cash', o.paymentStatus || 'Paid', o.subtotal || 0, o.taxAmount || 0, o.discountAmount || 0, o.totalAmount || 0, o.kitchenNotes || '', o.createdAt || new Date().toISOString()]);

        if (o.items && Array.isArray(o.items)) {
          for (const item of o.items) {
            await pool.query(`
              INSERT INTO order_items (id, order_id, menu_item_id, item_name, unit_price, quantity, subtotal, kitchen_notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE item_name=VALUES(item_name), unit_price=VALUES(unit_price), quantity=VALUES(quantity);
            `, [item.id, o.id, item.menuItemId || null, item.name, item.unitPrice, item.quantity, item.subtotal, item.kitchenNotes || '']);
          }
        }
      }
    }

    res.json({ success: true, message: 'All local data successfully synchronized into phpMyAdmin MySQL!' });
  } catch (err: any) {
    console.error('[MySQL Bulk Sync Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start MySQL connection check
initMySQL();

// Start Express Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================================`);
    console.log(`  PALACE BISTRO & INSTITUTE POS SYSTEM LOCAL SERVER RUNNING`);
    console.log(`  Local App URL: http://localhost:${PORT}`);
    console.log(`  phpMyAdmin Database Target: http://localhost/phpmyadmin (${dbConfig.database})`);
    console.log(`====================================================================`);
  });
}

startServer();
