# Mini CRM - Documentation

## 📚 Tài Liệu

| Tài Liệu | Mô Tả |
|-----------|--------|
| [USER.md](./USER.md) | Hướng dẫn sử dụng cho end users |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Hướng dẫn triển khai production |
| [DEVELOPER.md](./DEVELOPER.md) | Hướng dẫn phát triển cho developers |
| [AI.md](./AI.md) | Hướng dẫn dành cho AI/LLM |

---

## 🚀 Quick Start

```bash
# 1. Clone project
git clone <repo-url> Mini_CRM
cd Mini_CRM

# 2. Setup config (copy từ template)
cp config/config.php.example config/config.php
cp .env.example .env

# 3. Sửa credentials trong config/config.php
# DB_HOST, DB_NAME, DB_USER, DB_PASS

# 4. Setup database
mysql -u root -p < database/schema.sql

# 5. Chạy app
php -S localhost:8000 -t public
```

Truy cập: **http://localhost:8000**

---

## ⚙️ Setup Sau Khi Clone

```bash
# Copy config templates
cp config/config.php.example config/config.php
cp .htaccess.example .htaccess

# Sửa database credentials trong config/config.php
nano config/config.php
```

---

## 📁 Cấu Trúc Files Nhạy Cảm (Không Commit)

| File | Lý Do |
|------|-------|
| `config/config.php` | Chứa DB password |
| `.env` | Chứa secrets |
| `*.log` | Chứa runtime logs |
| `vendor/` | Dependencies |

Xem `.gitignore` đầy đủ.

---

## Tech Stack

- PHP 8.2+ | MySQL | Vanilla JS SPA | Tailwind CSS | Chart.js

---

## API Base URL

```
/api/auth/* - Authentication
/api/clients/* - Clients CRUD
/api/deals/* - Deals CRUD  
/api/dashboard - Dashboard stats
```
