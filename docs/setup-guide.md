# AegisTrial GCP Copilot — Developer Setup & Run Guide

Welcome to the **AegisTrial GCP Copilot** (Clinical Trial Risk Monitor) development guide. This repository is structured as a standard **npm workspaces** monorepo containing the Express API backend, React/Vite frontend oversight workspace, PostgreSQL database schemas, and shared TypeScript/Zod validation packages.

---

## 1. Prerequisites

Before running the application locally, ensure you have installed:

- **Node.js**: `v20.x` or higher (`v24.x`/`v25.x` recommended)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v15` or higher (local instance or cloud-hosted service such as Neon, Supabase, or AWS RDS)
- **Git**: Latest version

---

## 2. Cloning the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Clinical-Trial-Risk-Monitor
```

---

## 3. Environment Variables (`.env`)

Create a `.env` file in the root directory (or configure your shell environment):

```bash
# ============================================================================
# Database Configuration (PostgreSQL)
# ============================================================================
DATABASE_URL="postgres://postgres:postgres@localhost:5432/clinical_trial"

# ============================================================================
# Server Ports & Hosts
# ============================================================================
# Backend API Server Port (Defaults to 5001 to avoid macOS AirPlay conflict on 5000)
API_PORT=5001

# Frontend Web Application Port
WEB_PORT=3000

# Backend URL used by frontend Vite proxy
API_URL="http://localhost:5001"

# Base path for frontend routing
BASE_PATH="/"

# ============================================================================
# IBM watsonx / AI Model Credentials
# ============================================================================
WATSONX_APIKEY="your-ibm-cloud-api-key"
WATSONX_PROJECT_ID="your-watsonx-project-id"
WATSONX_URL="https://us-south.ml.cloud.ibm.com"
WATSONX_MODEL_ID="ibm/granite-13b-chat-v2"
```

---

## 4. Installation

Run standard `npm install` from the root directory. This automatically links all workspace packages (`src/artifacts/*` and `src/lib/*`):

```bash
npm install
```

---

## 5. Database Setup & Seeding

### 5.1 Push Schema to PostgreSQL
To synchronize your Drizzle ORM schema with your PostgreSQL database:

```bash
npm run push --workspace=@workspace/db
```

### 5.2 Seed Realistic Clinical Trial Data
To populate the database with trial sites, investigators, protocol rules, initial visit records, and deviations:

```bash
npm run seed --workspace=@workspace/db
```

---

## 6. Running the Applications

### Option A: Run Both Frontend & Backend Concurrently (Recommended)

To start both servers with a single command:

```bash
npm run dev:all
```
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/api/healthz](http://localhost:5001/api/healthz)

---

### Option B: Run Services Individually

#### 1. Backend API Server (Node.js + Express)
```bash
npm run dev:backend
```
*Starts the Express server on `http://localhost:5001` with auto-rebuild and live request logging.*

#### 2. Frontend Oversight Workspace (React / Next.js / Vite)
```bash
npm run dev:frontend
```
*Starts the client application on `http://localhost:3000` with hot-module reloading and `/api` reverse proxying.*

---

## 7. Useful NPM Workspace Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the frontend development server (`dev:frontend`) |
| `npm run dev:all` | Concurrently launches backend (port 5001) & frontend (port 3000) |
| `npm run dev:backend` | Launches the Express API server |
| `npm run dev:frontend` | Launches the frontend monitoring UI |
| `npm run build` | Builds all packages and production bundles across the monorepo |
| `npm run typecheck` | Executes TypeScript strict type-checking across all packages |
| `npm run typecheck:libs` | Builds TypeScript project references (`db`, `api-zod`, `api-client`) |

---

## 8. Role-Based Verification

The API layer enforces role-based access control (RBAC). When testing API endpoints via curl or Postman, include the `x-user-role` header:

```bash
# 1. Site Admin — Log Visit Record & Run Rule Engine
curl -X POST http://localhost:5001/api/records \
  -H "Content-Type: application/json" \
  -H "x-user-role: SITE_ADMIN" \
  -d '{
    "site_id": "<SITE_UUID>",
    "subject_id": "SUBJ-1048",
    "scheduled_date": "2026-09-01T09:00:00Z",
    "actual_date": "2026-09-03T15:00:00Z",
    "medications_logged": ["Acetaminophen"]
  }'

# 2. Risk Manager — View Open Protocol Deviations
curl -X GET http://localhost:5001/api/deviations \
  -H "x-user-role: RISK_MANAGER"

# 3. Risk Manager — Generate AI CAPA via IBM watsonx
curl -X POST http://localhost:5001/api/capa/generate \
  -H "Content-Type: application/json" \
  -H "x-user-role: RISK_MANAGER" \
  -d '{
    "deviation_id": "<DEVIATION_UUID>"
  }'
```
