# Mini CRM - Hướng Dẫn Triển Khai

## Yêu Cầu Hệ Thống

- **PHP**: 8.2 trở lên
- **Database**: MySQL 5.7+ hoặc MariaDB 10.6+
- **Web Server**: Apache (với mod_rewrite) hoặc PHP built-in server
- **Extensions**: pdo_mysql, json

---

## Cách 1: Chạy Local Với PHP Built-in Server

### Bước 1: Cài đặt database

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE minicrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
USE minicrm;
SOURCE /path/to/minicrm/database/schema.sql;
```

### Bước 2: Cấu hình database

Sửa file `config/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'minicrm');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

> **Lưu ý**: File mẫu `config/config.php.example` có sẵn trong repository. Copy và điền thông tin:</li>
>
> ```bash
> cp config/config.php.example config/config.php
> ```

### Bước 3: Cấp quyền user database

```sql
GRANT ALL PRIVILEGES ON minicrm.* TO 'your_db_user'@'localhost';
FLUSH PRIVILEGES;
```

### Bước 4: Chạy server

```bash
cd /path/to/Mini_CRM
php -S localhost:8000 -t public
```

Truy cập: `http://localhost:8000`

---

## Cách 2: Triển Khai Với Apache

### Bước 1: Upload code

```bash
# Upload vào /var/www/minicrm
sudo cp -r Mini_CRM /var/www/
```

### Bước 2: Cấp quyền

```bash
sudo chown -R www-data:www-data /var/www/minicrm
sudo chmod -R 755 /var/www/minicrm
```

### Bước 3: Cấu hình Virtual Host

Tạo file `/etc/apache2/sites-available/minicrm.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/minicrm/public

    <Directory /var/www/minicrm/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/minicrm_error.log
    CustomLog ${APACHE_LOG_DIR}/minicrm_access.log combined
</VirtualHost>
```

### Bước 4: Kích hoạt site

```bash
sudo a2ensite minicrm.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## Cách 3: Triển Khai Với Nginx

### Bước 1: Upload code

```bash
sudo cp -r Mini_CRM /var/www/minicrm
sudo chown -R www-data:www-data /var/www/minicrm
```

### Bước 2: Cấu hình Nginx

Tạo `/etc/nginx/sites-available/minicrm`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/minicrm/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

### Bước 3: Kích hoạt cấu hình

```bash
sudo ln -s /etc/nginx/sites-available/minicrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Triển Khai Với Docker (Tùy chọn)

### Dockerfile

```dockerfile
FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html

RUN a2enmod rewrite

EXPOSE 80
```

### Build & Run

```bash
docker build -t minicrm .
docker run -d -p 8080:80 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=minicrm \
  -e DB_USER=root \
  -e DB_PASS=password \
  minicrm
```

---

## Cấu Hình Bảo Mật

### 1. Environment Variables (Khuyến nghị)

Thay vì hard-code credentials trong config, dùng env vars:

```php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'minicrm');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
```

### 2. SSL/HTTPS

Khuyến nghị bật HTTPS với Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d your-domain.com
```

### 3. File Permissions

```bash
# Chỉ cho phép ghi vào thư mục cần thiết
sudo chmod 644 /var/www/minicrm/config/config.php
```

---

## Troubleshooting

### Lỗi 404 khi chạy
- Đảm bảo dùng `-t public` khi chạy PHP built-in server
- Kiểm tra `.htaccess` đã được kích hoạt (Apache)

### Lỗi kết nối database
- Kiểm tra credentials trong `config/config.php`
- Kiểm tra MySQL service đang chạy
- Kiểm tra user có quyền truy cập database

### Lỗi session
- Đảm bảo thư mục `sessions` tồn tại và có quyền ghi
- Kiểm tra PHP session configuration
