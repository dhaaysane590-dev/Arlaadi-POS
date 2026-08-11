# Palace Bistro & Institute POS System - phpMyAdmin MySQL Live Connectivity Guide

This application includes **direct live integration with phpMyAdmin / MySQL (XAMPP or WAMP)**.

When you place an order, add products, update stock, or record expenses in the app, **the new data is automatically saved directly into your phpMyAdmin MySQL database** (`palace_bistro_pos`).

---

## 🚀 How to Run the App & Connect to phpMyAdmin

### Step 1: Start XAMPP / WAMP / MySQL
1. Open **XAMPP Control Panel**.
2. Click **Start** next to **Apache** and **MySQL**.
3. Open your browser and go to `http://localhost/phpmyadmin`.

---

### Step 2: Start the POS Application
#### Option A: Windows Batch File (Easiest)
Double-click **`START_APP.bat`** in the project folder.

#### Option B: Terminal / Command Prompt
```bash
npm install
npm run dev
```

---

## ⚡ How Automatic Database Sync Works
1. When `npm run dev` starts, `server.ts` connects to your local MySQL (`localhost:3306`, user `root`, password ``).
2. It **automatically creates the database `palace_bistro_pos`** if it does not exist.
3. It **automatically creates all 12 database tables**:
   - `orders` (Main transaction sales records)
   - `order_items` (Individual items ordered in each receipt)
   - `menu_items` (Food & beverage catalog items)
   - `categories` (Menu categories)
   - `inventory` (Stock & raw ingredients)
   - `expenses` (Daily operating costs)
   - `customers` (Client balances & credit ledger)
   - `employees` (Staff members & PINs)
   - `dining_tables` (Floor plan tables)
   - `tenants` (Multi-branch records)
   - `settings` (Receipt & store preferences)
   - `pos_day_history` (EOD shift closing records)

4. **Live Order Saving**: As soon as an order is submitted on the POS screen, a live request (`POST /api/mysql/orders`) saves the order details and individual order items straight into phpMyAdmin!

---

## 🛠️ MySQL Configuration (`.env`)
If your phpMyAdmin / MySQL has a password or runs on a different port, create/edit `.env` in the root folder:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=palace_bistro_pos
```

---

## 📥 Importing Manual `.sql` File (Optional)
If you prefer to import the database structure manually into phpMyAdmin:
1. Open the POS App -> Go to **Settings** -> Click **Download Full SQL Database File**.
2. Go to `http://localhost/phpmyadmin` -> Create database `palace_bistro_pos`.
3. Click **Import** -> Select `palace_bistro_pos_database.sql` -> Click **Go**.
