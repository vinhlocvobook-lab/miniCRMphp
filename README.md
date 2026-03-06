# Mini CRM

A full-stack PHP MVC + SPA CRM application built with pure PHP 8.2+, Vanilla JavaScript, and Tailwind CSS.

## Features

- **Authentication**: Session-based auth with bcrypt password hashing
- **Dashboard**: Stats cards + Chart.js visualizations
- **Clients**: Full CRUD with search functionality
- **Deals**: Kanban board with drag-and-drop between stages

## Tech Stack

- PHP 8.2+ (Pure MVC, no framework)
- MariaDB 10.6+
- Vanilla JavaScript SPA
- Tailwind CSS (CDN)
- Chart.js (CDN)

## Project Structure

```
Mini_CRM/
├── index.php              # Front controller
├── router.php             # Router for PHP built-in server
├── .htaccess              # URL rewrite rules (Apache)
├── .htaccess.example      # Template for .htaccess
├── .gitignore             # Git ignore rules
├── .env.example           # Environment variables template
├── config/
│   ├── config.php         # App configuration (NOT committed)
│   ├── config.php.example # Template for config.php
│   └── database.php       # Database singleton
├── app/
│   ├── Models/
│   │   ├── Model.php
│   │   ├── UserModel.php
│   │   ├── ClientModel.php
│   │   └── DealModel.php
│   ├── Controllers/
│   │   ├── Controller.php
│   │   ├── AuthController.php
│   │   ├── ClientController.php
│   │   ├── DealController.php
│   │   └── DashboardController.php
│   └── Router.php
├── public/
│   ├── index.php          # Entry point for -t public
│   ├── css/app.css
│   └── js/
│       ├── app.js
│       ├── router.js
│       ├── api.js
│       ├── components/
│       │   ├── navbar.js
│       │   ├── modal.js
│       │   └── toast.js
│       └── pages/
│           ├── login.js
│           ├── register.js
│           ├── dashboard.js
│           ├── clients.js
│           └── deals.js
├── views/
│   └── shell.php
├── database/
│   └── schema.sql
└── docs/
    ├── README.md
    ├── USER.md
    ├── DEPLOYMENT.md
    ├── DEVELOPER.md
    └── AI.md
```

## Installation

### 1. Database Setup

Create a MariaDB database and import the schema:

```sql
CREATE DATABASE minicrm;
USE minicrm;
SOURCE database/schema.sql;
```

### 2. Configuration

> **Important**: `config/config.php` contains sensitive credentials and is NOT committed to git.

Copy the example config file:

```bash
cp config/config.php.example config/config.php
```

Then edit `config/config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'minicrm');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
```

### 3. Web Server Setup

Configure Apache or nginx to point to the Mini_CRM directory.

#### Apache (.htaccess is already configured)

#### nginx

Add this to your server config:

```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

## Demo Account

- **Email**: demo@minicrm.com
- **Password**: demo1234

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check auth status

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Clients
- `GET /api/clients` - List clients (supports ?search=query)
- `GET /api/clients/{id}` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Deals
- `GET /api/deals` - List deals
- `GET /api/deals/{id}` - Get single deal
- `POST /api/deals` - Create deal
- `PUT /api/deals/{id}` - Update deal
- `PATCH /api/deals/{id}/stage` - Update deal stage
- `DELETE /api/deals/{id}` - Delete deal

## Security Features

- PDO prepared statements (SQL injection prevention)
- CSRF tokens in session
- User data isolation (user_id check)
- Secure session cookies (HttpOnly, SameSite)
- Password hashing with bcrypt

## Deal Stages

1. **Lead** (Blue) - New potential client
2. **Contacted** (Yellow) - Initial contact made
3. **Proposal** (Orange) - Proposal sent
4. **Won** (Green) - Deal closed successfully
5. **Lost** (Red) - Deal lost

## UI Theme

- Sidebar: #1e293b (slate-800)
- Content: #f8fafc (slate-50)
- Accent: #6366f1 (indigo-500)

## License

MIT
