# BitBlog CMS Architecture Specification

## Architecture Overview

BitBlog CMS uses a clean multi-tier client-server architecture:

```
+-------------------------------------------------------------------+
|                        Frontend (React + Vite)                    |
|  - Public Journal / News Layout                                   |
|  - Personalized Reader Dashboard                                  |
|  - WordPress-inspired CMS Admin Dashboard                        |
|  - CSS Variables Design System (Light/Dark switchable)            |
+-------------------------------------------------------------------+
                                   | REST API (HTTP/JSON + JWT)
                                   v
+-------------------------------------------------------------------+
|                       Backend (Node.js + Express)                 |
|  - Helmet & Rate Limiter Security Guards                          |
|  - Modular Express API Routers                                    |
|  - Controller & Service business logic layers                      |
|  - Data Access Models with Oracle Parameterized Queries          |
+-------------------------------------------------------------------+
                                   | Oracle Call Interface / Pool
                                   v
+-------------------------------------------------------------------+
|                      Oracle Relational Database                   |
|  - Tables (USERS, POSTS, CATEGORIES, TAGS, COMMENTS, etc.)         |
|  - Foreign Key Constraints & Referential Integrity                 |
|  - Query Indexes & Performance Views                              |
+-------------------------------------------------------------------+
```

## Security & Authentication Flow
1. User authenticates via `/api/v1/auth/login`.
2. Backend verifies bcrypt hashed passwords and issues a signed JSON Web Token (JWT).
3. Client stores token securely and attaches `Authorization: Bearer <token>` to request headers.
4. Express `authMiddleware` decodes token and injects user identity context into request object.
5. Express `roleMiddleware` verifies role permissions (`Admin`, `Editor`, `Author`, `User`).

## Empty State Integrity
All summary metrics and statistics report `0` when database tables are empty, avoiding fake numbers or placeholder data.
