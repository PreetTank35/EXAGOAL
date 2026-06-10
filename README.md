# Faraway LMS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: Fullstack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20Supabase-blue)](https://github.com)

A production-ready, high-performance **Learning Management System** designed to deliver exceptional educational experiences. This application features a decoupled architecture combining a lightning-fast React frontend, a highly concurrent Python API engine, and a secure, row-level protected cloud database.

## 🚀 Core Features

* **Course Management:** Create, publish, and manage structured courses with ordered lessons.
* **Student Enrollment & Progress:** Enroll in courses, track lesson completion, and visualize progress.
* **Role-Based Access Control:** Three roles (student, instructor, admin) with server-enforced permissions.
* **Enterprise-Grade Security:** Supabase Auth with JWT verification, Row-Level Security, and CORS.
* **Responsive, Premium UI:** Dark-mode glassmorphism design with micro-animations and gradient accents.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, TypeScript | App Router, SSR, responsive UI |
| **Backend** | FastAPI, Pydantic v2, Uvicorn | Async REST API with type safety |
| **Database** | Supabase (PostgreSQL) | Auth, relational storage, RLS |

---

## 📂 Project Architecture

```text
Faraway project/
├── apps-frontend/              # Next.js Client Application
│   └── src/
│       ├── app/                # App Router (Pages & Layouts)
│       ├── components/         # UI Components
│       ├── hooks/              # Custom React Hooks
│       ├── services/           # API Client & Supabase
│       └── utils/              # Helper Functions
├── api-backend/                # FastAPI Server Application
│   └── src/
│       ├── main.py             # App entrypoint
│       ├── api/v1/endpoints/   # Route handlers
│       ├── core/               # Config, security, database
│       └── models/             # Pydantic schemas
└── supabase/                   # Database Infrastructure
    ├── migrations/             # SQL schema migrations
    └── seed.sql                # Development seed data
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and npm
- **Python** ≥ 3.11
- A **Supabase** project ([create one free](https://supabase.com/dashboard))

### 1. Database Setup

1. Create a new Supabase project
2. Go to **SQL Editor** and run `supabase/migrations/001_schema.sql`
3. Optionally run `supabase/seed.sql` (after creating test users in Auth)

### 2. Backend Setup

```bash
cd api-backend
cp .env.example .env
# Fill in your Supabase credentials in .env

pip install -r requirements.txt
uvicorn src.main:app --reload
```

API will be available at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd apps-frontend
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local

npm install
npm run dev
```

App will be available at `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (`api-backend/.env`)

| Variable | Description |
|:---|:---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) |
| `SUPABASE_JWT_SECRET` | JWT secret from Supabase settings |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Frontend (`apps-frontend/.env.local`)

| Variable | Description |
|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |

---

## 📜 License

This project is licensed under the MIT License.
