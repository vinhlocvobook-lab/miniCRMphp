# Mini CRM - Developer Guide

## Giới Thiệu

Mini CRM là ứng dụng SPA (Single Page Application) viết bằng PHP thuần + Vanilla JS. Tài liệu này giúp developer tiếp tục phát triển dự án.

---

## Cấu Trúc Dự Án

```
Mini_CRM/
├── index.php              # Front Controller - Entry point
├── router.php             # Router cho PHP├── public/
│ built-in server
   ├── index.php          # Entry point khi dùng -t public
│   ├── css/app.css        # Tailwind-compiled CSS
│   └── js/
│       ├── app.js         # Main SPA router
│       ├── api.js         # API client wrapper
│       ├── router.js      # Client-side router
│       ├── components/    # Reusable UI components
│       │   ├── navbar.js
│       │   ├── modal.js
│       │   └── toast.js
│       └── pages/         # Page-specific logic
│           ├── login.js
│           ├── register.js
│           ├── dashboard.js
│           ├── clients.js
│           └── deals.js
├── app/
│   ├── Router.php         # Server-side routing
│   ├── Controllers/      # Request handlers
│   └── Models/            # Data layer
├── config/
│   ├── config.php         # App & DB config
│   └── database.php       # PDO singleton
├── views/
│   └── shell.php          # SPA HTML shell
└── database/
    └── schema.sql         # DB schema
```

---

## Luồng Xử Lý Request

### 1. Client gửi request
```
GET /api/clients
```

### 2. public/index.php
- Parse URI
- Nếu bắt đầu `/api/` → require `index.php`

### 3. index.php (Front Controller)
- Load config + database
- Load Router với prefix `/api`
- Dispatch request

### 4. Router.php
- Match URL với routes đã định nghĩa
- Extract params từ URL
- Gọi Controller method

### 5. Controller
- Xử lý business logic
- Gọi Model để query database
- Trả về JSON response

---

## Thêm Route Mới

### Backend (PHP)

**File**: `index.php`

```php
// Thêm route mới
$router->get('/products', 'ProductController@index');
$router->post('/products', 'ProductController@store');
$router->get('/products/{id}', 'ProductController@show');
$router->put('/products/{id}', 'ProductController@update');
$router->delete('/products/{id}', 'ProductController@destroy');
```

**Tạo Controller**: `app/Controllers/ProductController.php`

```php
<?php
require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/ProductModel.php';

class ProductController extends Controller {
    private $productModel;

    public function __construct() {
        $this->productModel = new ProductModel();
    }

    public function index() {
        $userId = $this->requireAuth(); // Bắt buộc đăng nhập
        
        $products = $this->productModel->findByUserId($userId);
        $this->success(['products' => $products]);
    }

    public function show($id) {
        $userId = $this->requireAuth();
        
        $product = $this->productModel->findByIdAndUserId($id, $userId);
        if (!$product) {
            $this->error('Product not found', 404);
        }

        $this->success(['product' => $product]);
    }

    public function store() {
        $userId = $this->requireAuth();
        $data = $this->getInput();
        
        // Validate...
        
        try {
            $productId = $this->productModel->create($userId, $data);
            $product = $this->productModel->findByIdAndUserId($productId, $userId);
            $this->success(['product' => $product], 'Product created');
        } catch (Exception $e) {
            $this->error('Failed to create product');
        }
    }
}
```

**Tạo Model**: `app/Models/ProductModel.php`

```php
<?php
require_once __DIR__ . '/Model.php';

class ProductModel extends Model {
    protected $table = 'products';

    public function findByUserId($userId) {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        return $this->query($sql, [$userId])->fetchAll();
    }

    public function findByIdAndUserId($id, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ? AND user_id = ?";
        return $this->query($sql, [$id, $userId])->fetch();
    }

    public function create($userId, $data) {
        $sql = "INSERT INTO {$this->table} (user_id, name, ...) VALUES (?, ?, ...)";
        $this->query($sql, [$userId, $data['name'], ...]);
        return $this->lastInsertId();
    }

    // Override delete nếu cần user_id
    public function delete($id, $userId = null) {
        $sql = "DELETE FROM {$this->table} WHERE id = ? AND user_id = ?";
        $this->query($sql, [$id, $userId]);
        return true;
    }
}
```

### Frontend (JavaScript)

**Thêm page**: `public/js/pages/products.js`

```javascript
// Products page logic
export function renderProductsPage() {
    return `
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">Products</h1>
                <button onclick="products.showCreateModal()" 
                    class="bg-indigo-500 text-white px-4 py-2 rounded">
                    Add Product
                </button>
            </div>
            <div id="products-list"></div>
        </div>
    `;
}

export async function loadProducts() {
    try {
        const res = await api.get('/products');
        if (res.success) {
            renderProducts(res.data.products);
        }
    } catch (err) {
        toast.error('Failed to load products');
    }
}
```

**Đăng ký page trong app.js** (hoặc router.js):

```javascript
import { renderProductsPage, loadProducts } from './pages/products.js';

const routes = {
    '/': renderDashboardPage,
    '/clients': renderClientsPage,
    '/deals': renderDealsPage,
    '/products': renderProductsPage,
    // ...
};
```

---

## Controller Helpers

### Các method có sẵn trong Controller:

```php
// Trả về JSON success
$this->success($data, $message);

// Trả về JSON error  
$this->error($message, $statusCode);

// Bắt buộc đăng nhập, trả về user_id
$userId = $this->requireAuth();

// Lấy input từ request (JSON hoặc POST)
$data = $this->getInput();

// Validate CSRF token
$this->validateCSRF($token);
```

---

## Model Helpers

```php
// Query tự do
$stmt = $this->query($sql, $params);

// Lấy một record
$item = $this->findById($id);

// Lấy tất cả
$items = $this->findAll($orderBy, $orderDir);

// Lấy ID record vừa insert
$id = $this->lastInsertId();

// Delete (có thể override để thêm user_id)
$this->delete($id);
```

---

## Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### Config Database

Sửa `config/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'minicrm');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_password');
```

> **Tip**: Sử dụng file mẫu có sẵn:
> ```bash
> cp config/config.php.example config/config.php
> ```

---

## Database Schema

### Thêm bảng mới

```sql
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);
```

---

## JavaScript Utilities

### API Client (`api.js`)

```javascript
// GET
const res = await api.get('/endpoint');

// POST
const res = await api.post('/endpoint', { data: 'value' });

// PUT
const res = await api.put('/endpoint/1', { data: 'value' });

// DELETE
const res = await api.delete('/endpoint/1');

// PATCH
const res = await api.patch('/endpoint/1/stage', { stage: 'won' });
```

### Toast Notifications

```javascript
toast.success('Thành công!');
toast.error('Thất bại!');
toast.info('Thông tin!');
```

### Modal

```javascript
modal.show({
    title: 'Title',
    content: 'HTML content',
    onConfirm: () => { /* handle */ }
});
```

---

## Conventions

### PHP
- Classes: `PascalCase`
- Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Controllers extend `Controller`
- Models extend `Model`

### JavaScript
- Functions: `camelCase`
- Components: `PascalCase` (nếu dùng class)
- Import/Export: ES6 modules
- UI Events: `onclick`, `onSubmit` attributes

### CSS
- Dùng Tailwind CSS classes
- Custom CSS trong `public/css/app.css`

---

## Testing

### Test API với cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Get clients (với session cookie)
curl -b cookies.txt http://localhost:8000/api/clients

# Create client
curl -X POST http://localhost:8000/api/clients \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Client A","email":"client@a.com"}'
```

---

## Debug

### Bật PHP Errors

```php
// Trong index.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

### Xem SQL Queries

```php
// Trong Model.php - thêm log
protected function query($sql, $params = []) {
    error_log("SQL: " . $sql);
    error_log("PARAMS: " . json_encode($params));
    // ... rest of code
}
```

### Console Logs (JS)

```javascript
console.log('Debug:', data);
console.error('Error:', err);
```
