# Mini CRM - AI/LLM Developer Guide

> Dành cho AI/LLM để tiếp tục phát triển dự án này

---

## Project Overview

**Mini CRM** là một CRM application viết bằng:
- **Backend**: PHP 8.2+ thuần (không framework)
- **Frontend**: Vanilla JavaScript SPA + Tailwind CSS + Chart.js
- **Database**: MySQL/MariaDB
- **Architecture**: MVC pattern

---

## Tech Stack Details

| Component | Technology |
|-----------|------------|
| PHP Version | 8.2+ |
| Database | MySQL 5.7+ / MariaDB 10.6+ |
| Session | PHP native sessions |
| Auth | bcrypt + CSRF tokens |
| JS Modules | ES6 (import/export) |
| CSS | Tailwind CSS (CDN) |
| Charts | Chart.js 4.x |
| Server | PHP built-in / Apache / Nginx |

---

## Key Files

### Entry Points
- `index.php` - Main front controller
- `public/index.php` - Entry point when using `-t public`

### Core
- `app/Router.php` - Server-side routing
- `app/Controllers/Controller.php` - Base controller
- `app/Models/Model.php` - Base model

### Configuration
- `config/config.php` - App config + session + DB credentials
- `config/database.php` - PDO singleton

### Frontend
- `views/shell.php` - HTML shell (SPA)
- `public/js/app.js` - Main SPA router
- `public/js/api.js` - API client wrapper
- `public/js/router.js` - Client-side routing
- `public/js/pages/*.js` - Page components

---

## Running The App

### Development
```bash
cd Mini_CRM
php -S localhost:8000 -t public
# Access: http://localhost:8000
```

### Important: The `-t public` flag
Khi chạy PHP built-in server, **PHẢI** dùng `-t public`:
- URL `/css/app.css` sẽ map đến `public/css/app.css`
- File `public/index.php` là entry point xử lý tất cả requests

### Database Setup
```bash
mysql -u root -p < database/schema.sql
```

Config DB trong `config/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'minicrm');
define('DB_USER', 'minicrm_user');
define('DB_PASS', 'MatKhau123@');
```

> **Important**: Config file `config/config.php` chứa thông tin nhạy cảm và KHÔNG được commit lên git.
> Sử dụng file mẫu `config/config.php.example` hoặc tạo mới từ template.

---

## API Pattern

### Response Format
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

```json
{
  "success": false,
  "message": "Error message"
}
```

### Authentication
- Session-based auth với `$_SESSION['user_id']`
- Mọi protected route gọi `$this->requireAuth()` trong Controller
- CSRF token trong `$_SESSION['csrf_token']`

### Routing
Routes được định nghĩa trong `index.php`:

```php
$router->get('/endpoint', 'Controller@method');
$router->post('/endpoint', 'Controller@method');
$router->put('/endpoint/{id}', 'Controller@method');
$router->patch('/endpoint/{id}/action', 'Controller@method');
$router->delete('/endpoint/{id}', 'Controller@method');
```

---

## How To Add New Features

### 1. Backend: Add Route
Edit `index.php`:
```php
$router->get('/items', 'ItemController@index');
$router->post('/items', 'ItemController@store');
```

### 2. Backend: Create Controller
Create `app/Controllers/ItemController.php`:
```php
<?php
require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/ItemModel.php';

class ItemController extends Controller {
    private $itemModel;

    public function __construct() {
        $this->itemModel = new ItemModel();
    }

    public function index() {
        $userId = $this->requireAuth();
        $items = $this->itemModel->findByUserId($userId);
        $this->success(['items' => $items]);
    }
}
```

### 3. Backend: Create Model
Create `app/Models/ItemModel.php`:
```php
<?php
require_once __DIR__ . '/Model.php';

class ItemModel extends Model {
    protected $table = 'items';

    public function findByUserId($userId) {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        return $this->query($sql, [$userId])->fetchAll();
    }
}
```

### 4. Frontend: Add Page
Create `public/js/pages/items.js`:
```javascript
export function renderItemsPage() {
    return `<div id="items-page">...</div>`;
}

export async function loadItems() {
    const res = await api.get('/items');
    // render items
}
```

### 5. Frontend: Register Route
Update `public/js/app.js` routes object.

---

## Common Patterns

### Get User ID (Protected Route)
```php
$userId = $this->requireAuth(); // Returns user_id or exits with 401
```

### Get Input (JSON or POST)
```php
$data = $this->getInput(); // Returns associative array
```

### Return JSON Response
```php
$this->success(['item' => $item], 'Created successfully');
$this->error('Error message', 404);
```

### Model Query
```php
// Select all
$items = $this->findAll('created_at', 'DESC');

// Select one
$item = $this->findById($id);

// Custom query
$stmt = $this->query("SELECT * FROM table WHERE user_id = ?", [$userId]);
$items = $stmt->fetchAll();
```

### Important: Delete Method Signature
Nếu model cần user_id trong delete:
```php
// Model.php - base delete
public function delete($id, $userId = null) {
    // Handle both cases
}

// Child Model - override
public function delete($id, $userId = null) {
    // Must have default value for $userId to be compatible
}
```

---

## Frontend Patterns

### API Calls
```javascript
const res = await api.get('/endpoint');
const res = await api.post('/endpoint', { key: 'value' });
const res = await api.put('/endpoint/1', { key: 'value' });
const res = await api.patch('/endpoint/1/stage', { stage: 'won' });
const res = await api.delete('/endpoint/1');
```

### Show Toast
```javascript
toast.success('Success!');
toast.error('Error!');
toast.info('Info');
```

### Show Modal
```javascript
modal.show({
    title: 'Title',
    content: '<p>HTML content</p>',
    onConfirm: () => { /* action */ },
    confirmText: 'Save'
});
```

---

## Database Schema Location
`database/schema.sql` - Chứa CREATE TABLE statements

---

## Styling
- Dùng Tailwind CSS classes trực tiếp trong HTML/JS
- VD: `<div class="bg-white p-4 rounded-lg shadow">`
- Custom CSS trong `public/css/app.css`

---

## Debugging

### PHP Errors
Bật trong `index.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

### Check Logs
```bash
tail -f /var/log/apache2/error.log  # Apache
# Hoặc xem trực tiếp trong terminal khi chạy php -S
```

### JS Console
```javascript
console.log('debug', data);
console.error('error', err);
```

---

## Session Issues
Nếu gặp lỗi session:
1. Đảm bảo `session_status() === PHP_SESSION_NONE` trước khi gọi `session_start()`
2. Xem `config/config.php` - đã có check session status

---

## Common Fixes

### "Cannot use positional argument after named argument"
- Kiểm tra function calls trong Router.php
- Đảm bảo params được truyền đúng thứ tự

### 404 on refresh
- Đảm bảo dùng `-t public` khi chạy server
- Kiểm tra `public/index.php` đã xử lý routing đúng

### CSS/JS not loading
- Đảm bảo dùng đường dẫn tuyệt đối: `/css/app.css` (không `./css/app.css`)
- Server phải chạy với `-t public`

### Database connection error
- Kiểm tra credentials trong `config/config.php`
- Đảm bảo database đã được tạo và user có quyền truy cập

---

## Voice & Style (For Vibe Coding)

- Sử dụng ngôn ngữ thân thiện, hài hước nhẹ
- Giải thích vấn đề và cách fix một cách rõ ràng
- Khi không chắc chắn, hỏi lại user trước khi làm
- Ưu tiên fix nhỏ trước, refactor lớn sau
- Viết code theo style có sẵn ( conventions ở trên)

---

## 🔧 Troubleshooting

Nếu gặp lỗi, xem thêm [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## File Paths Summary

```
Mini_CRM/
├── index.php                          # Main entry
├── public/
│   ├── index.php                      # Entry for -t public
│   ├── css/app.css                    # Styles
│   └── js/
│       ├── app.js                     # SPA router
│       ├── api.js                     # API wrapper
│       └── pages/*.js                 # Page components
├── app/
│   ├── Router.php                     # Router class
│   ├── Controllers/
│   │   └── *Controller.php            # Controllers
│   └── Models/
│       └── *Model.php                  # Models
├── config/
│   ├── config.php                     # Config + session
│   └── database.php                   # DB connection
└── database/
    └── schema.sql                     # DB schema
```

---

## ⚠️ Common Pitfalls & How to Avoid Them

### 1. PHP Built-in Server Command

**ALWAYS use `-t public` flag:**
```bash
php -S localhost:8000 -t public
# NOT: php -S localhost:8000
```

Without `-t public`, static files (CSS/JS) won't load properly.

---

### 2. Static File Paths

**ALWAYS use absolute paths from root:**
```php
// ✅ Correct
<link rel="stylesheet" href="/css/app.css">
<script src="/js/app.js"></script>

// ❌ Wrong
<link rel="stylesheet" href="./css/app.css">
<script src="./js/app.js"></script>
```

---

### 3. Session Start (CRITICAL!)

**Check session status BEFORE starting:**
```php
// config/config.php - MUST have this check
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => false,
        'cookie_samesite' => 'Strict',
    ]);
}
```

**Rule**: Only call `session_start()` ONCE, in config file only.

---

### 4. Method Signature Compatibility

When overriding methods in child Models, ALWAYS use default values:
```php
// Model.php (parent)
public function delete($id, $userId = null) { ... }

// Child Model - MUST have default value
public function delete($id, $userId = null) { ... }
// NOT: public function delete($id, $userId)
```

---

### 5. Router Parameter Extraction

When using `preg_match` with named groups, filter properly:
```php
// ❌ Wrong - $matches has both numeric and named keys
array_shift($matches);

// ✅ Correct
$params = array_filter($matches, fn($key) => !is_numeric($key), ARRAY_FILTER_USE_KEY);
return $this->executeHandler($handler, array_values($params));
```

---

### 6. Testing API

Always test API with curl first:
```bash
# Check if server is running
curl http://localhost:8000/api/auth/check

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123"}'
```

---

### 7. Creating New Model

When creating a new Model that extends Model:
```php
// app/Models/ItemModel.php
<?php
require_once __DIR__ . '/Model.php';

class ItemModel extends Model {
    protected $table = 'items';

    // Use default values for user_id if needed
    public function findByUserId($userId) {
        $sql = "SELECT * FROM {$this->table} WHERE user_id = ?";
        return $this->query($sql, [$userId])->fetchAll();
    }

    // Override delete with default param
    public function delete($id, $userId = null) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        if ($userId !== null) {
            $sql .= " AND user_id = ?";
            $this->query($sql, [$id, $userId]);
        } else {
            $this->query($sql, [$id]);
        }
        return true;
    }
}
```

---

### 8. Creating New Controller

```php
// app/Controllers/ItemController.php
<?php
require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/../Models/ItemModel.php';

class ItemController extends Controller {
    private $itemModel;

    public function __construct() {
        $this->itemModel = new ItemModel();
    }

    public function index() {
        $userId = $this->requireAuth(); // Always require auth!
        $items = $this->itemModel->findByUserId($userId);
        $this->success(['items' => $items]);
    }

    public function show($id) {
        $userId = $this->requireAuth();
        $item = $this->itemModel->findByIdAndUserId($id, $userId);
        if (!$item) {
            $this->error('Item not found', 404);
        }
        $this->success(['item' => $item]);
    }
}
```

---

## 🛠️ Debug Checklist

When something doesn't work:

1. **Server running with `-t public`?**
2. **Paths are absolute `/css/app.css`?**
3. **No duplicate `session_start()`?**
4. **Method signatures have default values?**
5. **Router params filtered correctly?**
6. **Browser console (F12) shows errors?**
7. **PHP errors enabled?** (`error_reporting(E_ALL)`)

---

## 📋 Quick Reference

| Issue | Solution |
|-------|----------|
| 404 on `/` | Create `public/index.php`, use `-t public` |
| CSS/JS not loading | Use `/css/app.css` not `./css/app.css` |
| Session error | Check `session_status() === PHP_SESSION_NONE` |
| Method signature error | Add `= null` to overridden params |
| Router params error | Filter `$matches` with `array_filter` |
| 500 error | Check PHP error log + browser console |
