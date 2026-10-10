# DroneTV AI Support & Lead Assistant

A responsive full-stack web application with a rule-based chatbot that answers questions about drone services and training, collects customer/student enquiries, and gives administrators a dashboard to manage them.

> Built for the IPAGE Group *Full Stack Developer Intern* practical assignment. The UI and implementation are original; dronetv.in was used only for business context. Sample content lives in `frontend/src/data/content.ts`.

## Features

**Public site**
- Landing page with an animated drone "viewfinder" hero, Services, Courses, process, FAQ and Contact sections
- Fully responsive (mobile, tablet, desktop), light and dark theme, keyboard accessible, reduced-motion friendly
- Enquiry form with live validation, success state, server-error handling and a honeypot anti-spam field
- "Get a quote" / "Enquire" buttons pre-fill the form

**Chatbot**
- Floating chat widget on every page plus a full `/chat` page
- Answers the 7 predefined questions, plus greetings, pricing, rules, thanks and goodbye
- Weighted keyword and phrase matching, graceful fallback for unknown questions
- Conversation history kept for the session (survives refresh), clear/reset button, typing indicator, quick-reply chips
- Conversational lead capture (name, email, phone, type, interest, message) with per-step validation, summary and confirmation. Type `cancel` at any time.

**Admin dashboard** (`/admin`, JWT protected)
- Live stats and status/type distribution (click a card to filter)
- Debounced search, filter by Student/Customer/Other and by status, sorting, pagination
- Detail drawer, one-click status change (New, Contacted, In Progress, Closed), delete with confirmation
- Export filtered results to CSV (formula-injection safe)

**Backend**
- REST API with full CRUD, validation, consistent JSON responses
- Rate limiting, Helmet security headers, CORS allow-list, request size limit
- Parameterised SQL only, generic messages for server errors

## Technologies

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router, lucide-react, hand-written CSS |
| Backend | Node.js, Express 4, zod, helmet, cors, express-rate-limit, jsonwebtoken |
| Database | PostgreSQL 16 (node-postgres) |

## Project structure

```
FullStack_Chatbot_Task_FirstName_LastName/
├── backend/
│   ├── src/
│   │   ├── app.js              Express app, security middleware, routes
│   │   ├── server.js           Starts the server
│   │   ├── config.js           Reads and checks environment variables
│   │   ├── db.js               PostgreSQL pool
│   │   ├── initDb.js           Creates table / loads demo data
│   │   ├── routes/             auth.js, enquiries.js
│   │   ├── middleware/         auth.js, validate.js, errorHandler.js
│   │   └── utils/              schemas.js (zod), sanitize.js, AppError.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   └── src/
│       ├── chatbot/            engine.ts (intents), leadFlow.ts (enquiry steps)
│       ├── components/         ChatBot, ChatWidget, EnquiryForm, Navbar, Sections, ...
│       ├── pages/              Home, ChatPage, AdminLogin, AdminDashboard
│       ├── context/            Theme, Toast, Auth
│       ├── lib/                api.ts, validators.ts, format.ts
│       └── data/content.ts     Services, courses, FAQ, contact details
├── database/                   schema.sql, seed.sql
├── docs/API.md                 API documentation
└── docker-compose.yml          Optional PostgreSQL container
```

Data flow: **React frontend → REST API (Express) → validation/sanitising → PostgreSQL**.

## Setup

Requirements: Node.js 18+ and PostgreSQL 14+ (or Docker).

### 1. Database
```bash
# Option A: Docker
docker compose up -d

# Option B: local PostgreSQL
createdb dronetv_assistant
```
The table is created by `npm run db:init` (step 2). The SQL is also in `database/schema.sql`.

### 2. Backend
```bash
cd backend
cp .env.example .env        # then edit the values
npm install
npm run db:init             # create the table
npm run db:seed             # optional demo data for screenshots
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```
Open http://localhost:5173. Admin: http://localhost:5173/admin (use the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`).

Production build: `cd frontend && npm run build` (output in `frontend/dist`).

## Environment variables

`backend/.env`

| Variable | Description |
|---|---|
| `PORT` | API port (default 5000) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | PostgreSQL connection string |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma separated |
| `JWT_SECRET` | Long random string used to sign admin tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Dashboard login |

`frontend/.env` (optional): `VITE_API_URL`, only needed when the API is on another domain. In development Vite proxies `/api` to port 5000.

The server refuses to start if a required variable is missing. `.env` files are git-ignored.

## API endpoints

Full details and examples: [`docs/API.md`](docs/API.md)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | – | Admin login, returns JWT |
| GET | `/api/auth/me` | Admin | Current admin |
| POST | `/api/enquiries` | – | Create enquiry |
| GET | `/api/enquiries` | Admin | List (search, filter, sort, paginate) |
| GET | `/api/enquiries/:id` | Admin | Get one |
| PUT / PATCH | `/api/enquiries/:id` | Admin | Update |
| DELETE | `/api/enquiries/:id` | Admin | Delete |
| GET | `/api/enquiries/stats/summary` | Admin | Dashboard counts |
| GET | `/api/health` | – | Health and DB check |

## Security

- Validation on both sides (zod on the server is the source of truth)
- HTML tags and control characters stripped from text, React escapes output, SQL is parameterised
- Secrets only in environment variables, never in the repo
- JWT-protected admin routes, constant-time credential comparison, login rate limit
- Helmet headers, CORS allow-list, 10 KB body limit, rate limits on public submission
- Technical errors are logged on the server only; users see generic messages

## Error handling covered

Empty required fields, invalid email, invalid phone, failed API request (offline/timeout message), server or database error (generic message), unknown chatbot question (fallback), non-existing enquiry ID (404), invalid ID (400), expired session (redirect to sign in).

## Screenshots

Add your screenshots to `docs/screenshots/` and link them here:

| Home | Chatbot | Enquiry form |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Chatbot](docs/screenshots/chatbot.png) | ![Form](docs/screenshots/form.png) |

| Admin dashboard | Enquiry details | Mobile |
|---|---|---|
| ![Admin](docs/screenshots/admin.png) | ![Details](docs/screenshots/details.png) | ![Mobile](docs/screenshots/mobile.png) |

## Live demo

Add your deployed link here if available.
