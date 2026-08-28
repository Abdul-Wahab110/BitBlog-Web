# BitBlog Web CMS

A modern, high-performance, modular content management system (CMS) and blogging platform built with React, Vite, TypeScript, Express, and Oracle Database.

## 🚀 Overview

BitBlog CMS is built from the ground up for speed, security, elegance, and scale. It features a complete public-facing blog layout inspired by modern news and digital publication platforms, a personalized user dashboard, and a custom WordPress-inspired Admin CMS for full content management.

### Key Features
- **Public Publication Web Application**:
  - Home, Featured Articles Grid, Breaking News Ticker, Category & Tag filtering.
  - Article views, reading time estimation, bookmarks, comments, author profiles.
  - Pure CSS3 variable-driven design system supporting Light and Dark modes.
  - Responsive layouts optimized for 320px up to 1440px+ standard displays.
  - Standard semantic HTML5 tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<form>`, `<button>`).

- **WordPress-Inspired Admin CMS**:
  - Analytics & overview cards with pure empty states (0 fake data).
  - Complete post management (Publish, Draft, Schedule, Featured status).
  - Category, Tag, Comment moderation, User management, Media library, SEO settings, and System preferences.

- **Role-Based Security**:
  - User roles: Admin, Editor, Author, User.
  - JWT authentication & bcrypt password hashing.
  - Security middlewares: Helmet, CORS, Rate limiting, Input validation.

- **Oracle Database Layer**:
  - Relational schema defined with primary/foreign keys, indexes, and optimized database views.

---

## 📁 Repository Structure

```
/
├── frontend/             # React + Vite + TypeScript frontend
├── backend/              # Node.js + Express + TypeScript REST API
├── database/             # Oracle SQL schema DDL files (Tables, Constraints, Indexes, Views)
├── docs/                 # Architectural and setup documentation
├── .env.example          # Environment variables template
├── .gitignore            # Git exclusion settings
└── README.md             # Main repository documentation
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Styling**: Pure CSS3 with native CSS Custom Properties (Variables)
- **Themeing**: Centralized `ThemeContext` with `localStorage` persistence

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JSON Web Tokens (JWT) & bcrypt
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Database Driver**: `oracledb` connection pool architecture

### Database
- **Database Engine**: Oracle Database (19c/21c/23c or Express Edition XE)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Oracle Database instance (local XE instance or Oracle Cloud Autonomous DB)

### 1. Database Setup
Execute the SQL scripts located in `database/` in numerical order using SQL*Plus, SQL Developer, or Oracle SQLcl:

```bash
sqlplus admin/password@localhost:1521/XEPDB1 @database/01_create_tables.sql
sqlplus admin/password@localhost:1521/XEPDB1 @database/02_constraints.sql
sqlplus admin/password@localhost:1521/XEPDB1 @database/03_indexes.sql
sqlplus admin/password@localhost:1521/XEPDB1 @database/04_views.sql
```

> **Note**: No fake seed data is inserted into the database. All tables start empty ready for clean usage.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your Oracle database credentials and JWT secrets
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application will launch on `http://localhost:5173`.

---

## 🧪 Available Scripts

### Frontend
- `npm run dev` - Launch Vite development server
- `npm run build` - Compile TypeScript and bundle frontend for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Execute ESLint checks

### Backend
- `npm run dev` - Launch Express backend in development mode with `ts-node-dev`
- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Launch production backend server from `dist/server.js`

---

## 🛡️ Security Best Practices
- Never commit actual `.env` files with database credentials or production JWT secrets.
- Input validation enforced on both frontend and backend API endpoints.
- Role-based authorization guard rails protecting sensitive CMS administrative routes.

---

## 📄 License
MIT License. Created for BitBlog Web CMS.
