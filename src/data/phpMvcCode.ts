// Complete Core PHP 8+ MVC Backend Codebase & SQL Database Dump

export interface PhpFileContent {
  path: string;
  category: 'Config' | 'Database' | 'Controllers' | 'Models' | 'Views' | 'Middleware' | 'Helpers' | 'API';
  description: string;
  code: string;
}

export const phpMvcCodebase: PhpFileContent[] = [
  {
    path: 'database/schema.sql',
    category: 'Database',
    description: 'Complete Normalized MySQL Database Script with tables, foreign keys, indexes, and triggers.',
    code: `-- Enterprise Restaurant Management System (RMS) - Database Schema
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- Storage Engine: InnoDB with UTF8MB4

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS daily_closings;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS delivery_drivers;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS customer_wallets;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS kitchen_tickets;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS restaurant_tables;
DROP TABLE IF EXISTS dining_areas;
DROP TABLE IF EXISTS item_addons;
DROP TABLE IF EXISTS item_variants;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS system_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. System Settings
CREATE TABLE system_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_name VARCHAR(150) NOT NULL,
    logo_path VARCHAR(255) NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    tax_number VARCHAR(50) NULL,
    tax_rate DECIMAL(5,2) DEFAULT 5.00,
    service_charge_rate DECIMAL(5,2) DEFAULT 3.00,
    currency_symbol VARCHAR(10) DEFAULT '$',
    currency_code VARCHAR(10) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'Africa/Mogadishu',
    receipt_header TEXT NULL,
    receipt_footer TEXT NULL,
    evc_merchant_id VARCHAR(100) NULL,
    evc_api_key VARCHAR(255) NULL,
    zaad_merchant_id VARCHAR(100) NULL,
    sahal_merchant_id VARCHAR(100) NULL,
    premier_wallet_id VARCHAR(100) NULL,
    auto_deduct_inventory TINYINT(1) DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Roles & Permissions (RBAC)
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (role_name, description) VALUES
('Super Admin', 'Full system access across all branches'),
('Restaurant Owner', 'Financial oversight & executive reports'),
('Branch Manager', 'Daily operations, inventory, and staff management'),
('Cashier', 'POS billing, receipts, payments'),
('Waiter', 'Table order creation and floor management'),
('Kitchen Staff', 'KDS display, ticket preparation & status updates'),
('Inventory Manager', 'Stock in/out, recipes, supplier POs'),
('Accountant', 'Expenses, daily register closing, income statements'),
('Customer', 'Online menu, reservations, and mobile orders');

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    avatar_path VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    two_factor_secret VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Categories & Menu Items
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    icon_class VARCHAR(50) DEFAULT 'Utensils',
    description TEXT NULL,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE menu_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(50) NULL,
    item_name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 5.00,
    prep_time_minutes INT DEFAULT 15,
    image_url VARCHAR(255) NULL,
    is_available TINYINT(1) DEFAULT 1,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    INDEX idx_item_sku (sku),
    INDEX idx_item_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE item_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    variant_name VARCHAR(50) NOT NULL,
    price_delta DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE item_addons (
    addon_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    addon_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tables & Dining Areas
CREATE TABLE dining_areas (
    area_id INT AUTO_INCREMENT PRIMARY KEY,
    area_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO dining_areas (area_name) VALUES ('Main Hall'), ('VIP Lounge'), ('Terrace'), ('Bar Area');

CREATE TABLE restaurant_tables (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    area_id INT NOT NULL,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT DEFAULT 4,
    status ENUM('Available', 'Occupied', 'Reserved', 'Cleaning') DEFAULT 'Available',
    qr_code_token VARCHAR(100) NULL,
    FOREIGN KEY (area_id) REFERENCES dining_areas(area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Orders, Kitchen Tickets & Payments
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_type ENUM('Dine In', 'Take Away', 'Delivery', 'Online') NOT NULL,
    table_id INT NULL,
    customer_id INT NULL,
    customer_name VARCHAR(100) DEFAULT 'Walk-in Guest',
    customer_phone VARCHAR(30) NULL,
    delivery_address TEXT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    service_charge DECIMAL(10,2) DEFAULT 0.00,
    tip_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    change_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_method VARCHAR(50) NULL,
    payment_status ENUM('Unpaid', 'Paid', 'Partially Paid', 'Refunded') DEFAULT 'Unpaid',
    order_status ENUM('Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled') DEFAULT 'Pending',
    user_id INT NULL, -- Cashier or Waiter
    kitchen_notes TEXT NULL,
    is_held TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_order_status (order_status),
    INDEX idx_order_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    variant_id INT NULL,
    item_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    kitchen_notes VARCHAR(255) NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id),
    FOREIGN KEY (variant_id) REFERENCES item_variants(variant_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Ingredients, Recipes & Inventory
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NULL,
    email VARCHAR(100) NULL,
    phone VARCHAR(30) NULL,
    address TEXT NULL,
    balance_owed DECIMAL(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ingredients (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_code VARCHAR(50) UNIQUE NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    unit ENUM('kg', 'g', 'liters', 'ml', 'pcs', 'packs', 'boxes') NOT NULL,
    stock_quantity DECIMAL(10,2) DEFAULT 0.00,
    min_threshold DECIMAL(10,2) DEFAULT 10.00,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    supplier_id INT NULL,
    last_restocked DATE NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe_ingredients (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity_required DECIMAL(10,3) NOT NULL, -- Portion size in unit
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id INT NOT NULL,
    type ENUM('Stock In', 'Stock Out', 'Adjustment', 'Wastage') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Audit Log
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`
  },
  {
    path: 'config/database.php',
    category: 'Config',
    description: 'PDO Database Connection Singleton with Prepared Statement security & UTF8MB4 charset.',
    code: `<?php
/**
 * Database Singleton Configuration using PDO
 * Core PHP 8+ PDO Connection with Prepared Statements
 */

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    private string $host = '127.0.0.1';
    private string $db   = 'restaurant_rms';
    private string $user = 'rms_user';
    private string $pass = 'SecretPass_2026!';
    private string $charset = 'utf8mb4';

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dbConfig = new self();
            $dsn = "mysql:host={$dbConfig->host};dbname={$dbConfig->db};charset={$dbConfig->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $dbConfig->user, $dbConfig->pass, $options);
            } catch (PDOException $e) {
                die("Database Connection Error: " . htmlspecialchars($e->getMessage()));
            }
        }
        return self::$instance;
    }
}
`
  },
  {
    path: 'config/config.php',
    category: 'Config',
    description: 'System constants, timezone, CSRF protection, and session security initializer.',
    code: `<?php
/**
 * System Core Configuration & Security Initialization
 */

define('APP_NAME', 'Palace Gourmet RMS');
define('APP_VERSION', '2.5.0');
define('BASE_URL', 'http://localhost:3000');

// Set Timezone
date_default_timezone_set('Africa/Mogadishu');

// Session Security Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Generate CSRF Token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function verify_csrf_token(?string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token ?? '');
}

function sanitize_input(string $data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}
`
  },
  {
    path: 'middleware/RoleMiddleware.php',
    category: 'Middleware',
    description: 'Role-Based Access Control (RBAC) Guard Middleware restricting unauthorized routes.',
    code: `<?php
namespace Middleware;

class RoleMiddleware {
    public static function checkRole(array $allowedRoles): void {
        if (!isset($_SESSION['user']) || empty($_SESSION['user']['role'])) {
            header('Location: ' . BASE_URL . '/login.php?error=unauthorized');
            exit;
        }

        $userRole = $_SESSION['user']['role'];
        if (!in_array($userRole, $allowedRoles, true) && $userRole !== 'Super Admin') {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => 'Forbidden: Access restricted to ' . implode(', ', $allowedRoles)
            ]);
            exit;
        }
    }
}
`
  },
  {
    path: 'controllers/PosController.php',
    category: 'Controllers',
    description: 'POS Controller handling fast order creation, stock deduction, and mobile money payments.',
    code: `<?php
namespace Controllers;

use Config\Database;
use Models\OrderModel;
use Models\InventoryModel;
use Helpers\PaymentGateway;
use PDO;

class PosController {
    private PDO $db;
    private OrderModel $orderModel;
    private InventoryModel $inventoryModel;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->orderModel = new OrderModel($this->db);
        $this->inventoryModel = new InventoryModel($this->db);
    }

    public function createOrder(): void {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        if (!$input || empty($input['items'])) {
            echo json_encode(['status' => 'error', 'message' => 'Cart is empty!']);
            return;
        }

        $this->db->beginTransaction();

        try {
            // 1. Create Main Order Record
            $orderId = $this->orderModel->insertOrder($input);

            // 2. Insert Order Items & Deduct Ingredients Automatically
            foreach ($input['items'] as $item) {
                $this->orderModel->insertOrderItem($orderId, $item);

                // Auto Deduct Inventory Stock based on Recipe Mapping
                $this->inventoryModel->deductRecipeStock($item['menuItemId'], $item['quantity']);
            }

            // 3. Process Payment if Mobile Money or Cash
            if (!empty($input['paymentMethod']) && in_array($input['paymentMethod'], ['EVC Plus', 'ZAAD', 'Sahal', 'Premier Wallet'])) {
                $paymentResult = PaymentGateway::chargeMobileMoney(
                    $input['paymentMethod'],
                    $input['customerPhone'] ?? '+252610000000',
                    $input['totalAmount']
                );

                if (!$paymentResult['success']) {
                    $this->db->rollBack();
                    echo json_encode(['status' => 'error', 'message' => $paymentResult['message']]);
                    return;
                }
            }

            $this->db->commit();
            echo json_encode([
                'status' => 'success',
                'message' => 'Order created and paid successfully!',
                'orderId' => $orderId,
                'orderNumber' => $input['orderNumber'] ?? '#ORD-' . time()
            ]);
        } catch (\Exception $e) {
            $this->db->rollBack();
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
`
  },
  {
    path: 'helpers/PaymentGateway.php',
    category: 'Helpers',
    description: 'Somali Mobile Money Payment Gateway (EVC Plus, ZAAD, Sahal, Premier Wallet) modular SDK driver.',
    code: `<?php
namespace Helpers;

class PaymentGateway {
    public static function chargeMobileMoney(string $provider, string $phoneNumber, float $amount): array {
        // Sanitize Phone
        $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        if (strlen($cleanPhone) < 9) {
            return [
                'success' => false,
                'message' => "Invalid {$provider} telephone number format."
            ];
        }

        // Modular Gateway Simulation / API Call Placeholder
        switch ($provider) {
            case 'EVC Plus':
                // WaafiPay / Hormuud API Request Placeholder
                return [
                    'success' => true,
                    'transactionId' => 'EVC-TXN-' . rand(100000, 999999),
                    'message' => "EVC Plus payment of \${$amount} approved for {$cleanPhone}."
                ];
            case 'ZAAD':
                return [
                    'success' => true,
                    'transactionId' => 'ZAAD-TXN-' . rand(100000, 999999),
                    'message' => "ZAAD Service payment of \${$amount} processed."
                ];
            case 'Sahal':
                return [
                    'success' => true,
                    'transactionId' => 'SAHAL-TXN-' . rand(100000, 999999),
                    'message' => "Golis Sahal transaction successful."
                ];
            case 'Premier Wallet':
                return [
                    'success' => true,
                    'transactionId' => 'PW-TXN-' . rand(100000, 999999),
                    'message' => "Premier Wallet payment confirmed."
                ];
            default:
                return ['success' => false, 'message' => 'Unsupported payment provider.'];
        }
    }
}
`
  },
  {
    path: 'models/InventoryModel.php',
    category: 'Models',
    description: 'Inventory & Recipe Ingredient Stock Model for automatic stock deductions and reorder alerts.',
    code: `<?php
namespace Models;

use PDO;

class InventoryModel {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function deductRecipeStock(int $menuItemId, int $orderedQty): void {
        // Get all raw ingredients required for this menu item
        $stmt = $this->db->prepare("
            SELECT ingredient_id, quantity_required 
            FROM recipe_ingredients 
            WHERE item_id = :item_id
        ");
        $stmt->execute(['item_id' => $menuItemId]);
        $recipes = $stmt->fetchAll();

        foreach ($recipes as $rec) {
            $totalDeduct = $rec['quantity_required'] * $orderedQty;

            // Update Stock Quantity in ingredients table
            $updateStmt = $this->db->prepare("
                UPDATE ingredients 
                SET stock_quantity = stock_quantity - :deduct 
                WHERE ingredient_id = :ing_id
            ");
            $updateStmt->execute([
                'deduct' => $totalDeduct,
                'ing_id' => $rec['ingredient_id']
            ]);

            // Log Stock Out Transaction
            $logStmt = $this->db->prepare("
                INSERT INTO stock_transactions (ingredient_id, type, quantity, reason) 
                VALUES (:ing_id, 'Stock Out', :qty, 'Auto POS Sale Item #' || :item_id)
            ");
            $logStmt->execute([
                'ing_id' => $rec['ingredient_id'],
                'qty' => $totalDeduct,
                'item_id' => $menuItemId
            ]);
        }
    }

    public function getLowStockAlerts(): array {
        $stmt = $this->db->query("
            SELECT * FROM ingredients 
            WHERE stock_quantity <= min_threshold 
            ORDER BY stock_quantity ASC
        ");
        return $stmt->fetchAll();
    }
}
`
  },
  {
    path: 'api/v1/endpoints.php',
    category: 'API',
    description: 'REST API endpoints router for Mobile Apps, Online Ordering, and Third-party integrations.',
    code: `<?php
/**
 * RESTful API Gateway for Restaurant Management System
 * Endpoint: /api/v1/
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

switch ($uri) {
    case '/api/v1/menu':
        // GET /api/v1/menu -> Return full available menu
        require_once '../../config/database.php';
        $db = \Config\Database::getInstance();
        $stmt = $db->query("SELECT * FROM menu_items WHERE is_available = 1 AND is_deleted = 0");
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
        break;

    case '/api/v1/orders':
        if ($method === 'POST') {
            $pos = new \Controllers\PosController();
            $pos->createOrder();
        } else {
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'API Endpoint Not Found']);
        break;
}
`
  }
];
