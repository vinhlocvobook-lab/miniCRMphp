# Mini CRM - Troubleshooting Guide

> Hướng dẫn xử lý các lỗi thường gặp

---

## 🔧 PHP Built-in Server

### Lỗi 404 khi truy cập `/`

**Nguyên nhân**: Thiếu `index.php` trong thư mục `public`

**Giải pháp**: Tạo `public/index.php` để xử lý routing:

```php
<?php
// public/index.php - Entry point khi dùng -t public

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH;

// API routes
if (strpos($uri, '/api/') === 0 || $uri === '/api') {
    $_SERVER['SCRIPT_NAME'] = '/index.php';
    require __DIR__ . '/../index.php';
    return;
}

// Serve static files
$ext = pathinfo($uri, PATHINFO_EXTENSION);
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff'];

if (in_array($ext, $staticExtensions)) {
    $file = __DIR__ . $uri;
    if (is_file($file)) {
        return false;
    }
}

// SPA shell
require __DIR__ . '/../views/shell.php';
```

**Quan trọng**: Luôn chạy server với flag `-t public`:
```bash
php -S localhost:8000 -t public
```

---

## 📁 Đường Dẫn Static Files

### Lỗi CSS/JS không load được

**Nguyên nhân**: Dùng đường dẫn tương đối `./css/app.css` trong khi file nằm ở thư mục khác

**Giải pháp**: Luôn dùng đường dẫn tuyệt đối từ root:

```php
// ✅ Đúng
<link rel="stylesheet" href="/css/app.css">
<script src="/js/app.js" type="module"></script>

// ❌ Sai
<link rel="stylesheet" href="./css/app.css">
<script src="./js/app.js" type="module"></script>
```

**Vì sao**: Khi dùng `-t public`, URL `/css/app.css` sẽ map đến `public/css/app.css`

---

## 🗄️ Database Model

### Lỗi "Declaration must be compatible with parent"

**Nguyên nhân**: PHP 8 yêu cầu method signature phải tương thích với parent class

**Ví dụ lỗi**:
```php
// Model.php (parent)
public function delete($id) { ... }

// ClientModel.php (child) - ❌ LỖI
public function delete($id, $userId) { ... }
```

**Giải pháp**: Thêm default value cho parameter:

```php
// ✅ Đúng
public function delete($id, $userId = null) { ... }
```

**Áp dụng cho**: Tất cả methods trong Model nếu override từ parent class

---

## 🔐 Session

### Lỗi "session_start(): Ignoring session_start() because a session is already active"

**Nguyên nhân**: Gọi `session_start()` 2 lần (trong `index.php` và `config.php`)

**Giải pháp**: Kiểm tra trước khi start session:

```php
// config/config.php
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => false,
        'cookie_samesite' => 'Strict',
    ]);
}
```

**Nguyên tắc**: Chỉ gọi `session_start()` một lần, đặt trong config

---

## 🛤️ Router

### Lỗi "Cannot use positional argument after named argument"

**Nguyên nhân**: `$matches` từ `preg_match` chứa cả numeric keys và named keys

**Code lỗi**:
```php
$pattern = $this->convertToRegex($route);
if (preg_match($pattern, $uri, $matches)) {
    array_shift($matches); // ❌ Lỗi - không works với named keys
    return $this->executeHandler($handler, $matches);
}
```

**Giải pháp**:
```php
$pattern = $this->convertToRegex($route);
if (preg_match($pattern, $uri, $matches)) {
    // Lọc chỉ giữ named params
    $params = array_filter($matches, fn($key) => !is_numeric($key), ARRAY_FILTER_USE_KEY);
    return $this->executeHandler($handler, array_values($params));
}
```

---

## 🖥️ JavaScript

### Lỗi "Can't find variable: Content"

**Nguyên nhân**: Typo - viết `Content` thay vì `el.textContent`

**Code lỗi**:
```javascript
document.querySelectorAll('[data-count]').forEach(el => {
   Content = '0';  // ❌ Lỗi - variable không tồn tại
});
```

**Giải pháp**:
```javascript
document.querySelectorAll('[data-count]').forEach(el => {
   el.textContent = '0';  // ✅ Đúng
});
```

**Tip**: Luôn kiểm tra console browser (F12) để phát hiện lỗi JS

---

## 📦 CDN Assets

### Lỗi "Failed to load source map" (.map file)

**Nguyên nhân**: CDN trả về file không có source map

**Giải pháp**: Chỉ định version cụ thể:

```php
// ❌ LỖI - có thể không có source map
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// ✅ ĐÚNG - version cụ thể
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

**Lưu ý**: Lỗi này chỉ là warning, không ảnh hưởng đến hoạt động

---

## 🐘 Database

### Lỗi kết nối database

**Kiểm tra**:
1. MySQL service đang chạy?
2. Credentials trong `config/config.php` đúng?
3. User có quyền truy cập database?

```bash
# Test kết nối
mysql -u your_user -p -h localhost your_database
```

---

## ✅ Checklist Debug

Khi gặp lỗi, kiểm tra theo thứ tự:

1. **Server đang chạy đúng cách?**
   - Dùng `php -S localhost:8000 -t public` ✓

2. **Đường dẫn file đúng?**
   - CSS/JS dùng `/css/app.css` không `./css/app.css` ✓

3. **PHP errors hiển thị?**
   - Bật `error_reporting(E_ALL)` trong index.php ✓

4. **Session không start 2 lần?**
   - Kiểm tra `session_status()` trước khi gọi ✓

5. **Method signature tương thích?**
   - Parent/child methods có default values ✓

6. **Console browser có lỗi JS?**
   - F12 → Console tab ✓

---

## 📝 Mẹo Tránh Lỗi

### Cho Developer

1. **Luôn dùng `-t public`** khi chạy PHP built-in server
2. **Đường dẫn tuyệt đối** cho static files (`/css/`, `/js/`)
3. **Kiểm tra session** trước khi `session_start()`
4. **Default values** cho overridden methods
5. **Test API** với curl trước khi test UI:
   ```bash
   curl http://localhost:8000/api/auth/check
   ```

### Cho AI/LLM

1. **Luôn hỏi user** cách chạy server (`php -S ... -t public`)
2. **Dùng đường dẫn tuyệt đối** `/path` không `./path`
3. **Kiểm tra method signatures** khi tạo Model mới
4. **Thêm session_status check** trong mọi file config
5. **Validate params** từ regex router
6. **Test nhỏ trước, lớn sau** - không viết nhiều code rồi test một lần

---

## 🔗 Related Docs

- [DEVELOPER.md](./DEVELOPER.md) - Hướng dẫn phát triển
- [AI.md](./AI.md) - Hướng dẫn cho AI/LLM
