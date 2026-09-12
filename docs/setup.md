# BitBlog CMS Developer Setup Guide

## Local Environment Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Oracle Database**: XE (Express Edition 19c/21c) or Cloud Autonomous Database Instance

## Quick Setup Guide

### 1. Database Setup
Ensure Oracle service is running locally or remotely. Connect as a database user with table creation privileges (`CREATE TABLE`, `CREATE VIEW`, `CREATE INDEX`, `CREATE SEQUENCE`).

Run the DDL scripts in `database/`:
- `database/01_create_tables.sql`
- `database/02_constraints.sql`
- `database/03_indexes.sql`
- `database/04_views.sql`

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env to set DB_USER, DB_PASSWORD, DB_CONNECT_STRING, and JWT_SECRET
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to test the application interface.
