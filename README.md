# SampleSeva

**SampleSeva** is a diagnostic laboratory test booking marketplace — browse 120+ diagnostic tests, compare lab prices, and book home sample collection or lab visits, all in one place.

The application is a full-stack demo product with a real production-oriented backend:

- **Frontend** — React 19 + TypeScript + Vite + Tailwind CSS, with a catalogue of tests, health packages, laboratories, a 5-step booking flow, and customer accounts.
- **Backend** — Node.js + Express + TypeScript (Mongoose) REST API backed by **MongoDB Atlas**, with JWT-session authentication, user-scoped bookings and saved addresses.

> **Status:** Phases 1–6 complete — catalogue, booking flow, customer accounts, real auth, real booking/address APIs, MongoDB persistence, and production-readiness configuration. Phase 7 adds repository/deployment preparation.

---

## What the application does

- Browse **120+ diagnostic tests** with sample type, fasting, preparation, report-time and pricing details
- Explore **health packages** (curated test combinations at a single price)
- Compare **laboratories** by rating, price and home-collection availability
- Book tests through a **5-step flow** (collection → date & time → patient → address → review)
- Choose **home collection** (with saved addresses) or **lab visit**
- Create a **customer account**, log in/out (httpOnly-cookie JWT sessions)
- Save, edit, delete and set-default **addresses** for faster booking
- Track **My Bookings**: view details, cancel, refresh persistence
- All user data, addresses and bookings persist in **MongoDB** (not localStorage)

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5, TypeScript (strict) |
| Database | MongoDB Atlas (Mongoose 9 ODM) |
| Auth | JWT in an httpOnly `SameSite=Lax` cookie, bcryptjs password hashing |
| Security | Helmet, CORS (configurable origin), express-rate-limit, request body limits |
| Tests | Node's built-in test runner (`node:test`) + supertest |

## Repository layout

```
.
├── src/                  # React frontend (Vite app)
│   ├── components/       # UI components (layout, cards, home, auth, ui)
│   ├── context/          # AuthContext (API-backed session)
│   ├── hooks/            # useApi, usePageTitle
│   ├── lib/              # api.ts (typed API client), catalogue, utils
│   ├── pages/            # Route pages (Home, Tests, Labs, Bookings, Account, …)
│   ├── data/             # Static/demo catalogue data (fallback & static consumers)
│   └── types/            # Shared TypeScript types
├── server/               # Express + MongoDB backend
│   ├── src/
│   │   ├── config/       # env.ts, database.ts
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # auth, errorHandler, notFound, rateLimiter
│   │   ├── models/       # Mongoose models (User, Address, Test, Lab, …)
│   │   ├── routes/       # REST route modules
│   │   ├── services/     # Business logic (auth, booking, address, catalogue)
│   │   ├── utils/        # ApiError, auth helpers, query utils
│   │   ├── validators/   # Input validation
│   │   ├── seed.ts       # Idempotent catalogue seeder
│   │   ├── migrate.ts    # Idempotent index migration
│   │   ├── app.ts        # Express app factory
│   │   └── server.ts     # Startup (env → DB → listen)
│   └── tests/            # Backend integration tests
├── .env.example          # Frontend env template
└── package.json          # Root scripts (frontend + server orchestration)
```

## Frontend setup

```bash
# Install dependencies
npm install

# Start the Vite dev server (http://localhost:5173)
npm run dev
```

The frontend reads the API base URL from `VITE_API_URL` at build time (see **Environment variables**). By default it uses `http://localhost:4000` in development and the same origin in production builds.

## Backend setup

```bash
cd server
npm install

# Configure environment (see server/.env.example)
cp .env.example .env   # then fill in real values

# Run database migrations + seed the catalogue (both idempotent)
npm run migrate
npm run seed

# Start the API in development (http://localhost:4000, hot reload)
npm run dev
```

## MongoDB setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) (or use a local `mongod`).
2. Create a database user and allow network access from your environment.
3. Put the connection string (with credentials) in `server/.env` as `MONGODB_URI`.
4. Run `npm run migrate` (creates/fixes indexes — safe to re-run) and `npm run seed` (loads the 120+ test catalogue, packages, labs and lab-test offerings — idempotent).

The API **will not start without a reachable MongoDB** — a failed connection is fatal by design.

## Required environment variables

### Frontend (`VITE_` — set at build time)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Optional | Base URL of the backend API. Unset → `http://localhost:4000` in dev, same origin in production builds. Set it when the API is hosted on a different origin (e.g. `https://api.sampleseva.example.com`). |

### Backend (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | Optional | `development` (default) / `production` / `test`. Production enables fail-fast config validation, secure cookies and combined logging. |
| `PORT` | Optional | API port (default `4000`). |
| `CLIENT_URL` | **Required in production** | Frontend origin for CORS, e.g. `https://app.sampleseva.example.com`. |
| `MONGODB_URI` | **Always required** | MongoDB connection string (Atlas in production). The server refuses to start without it. |
| `JWT_SECRET` | **Required in production** (≥ 32 chars) | Long random secret used to sign session tokens. Never share or commit it. |

## Development commands

From the project root:

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite frontend dev server |
| `npm run server:dev` | Start the backend in watch mode (`tsx watch`) |
| `npm run typecheck` | Frontend TypeScript check |
| `npm run server:typecheck` | Backend TypeScript check |
| `npm run server:test` | Run the backend test suite (requires a local MongoDB on `27017` or `TEST_MONGODB_URI`) |
| `npm run server:seed` | Seed the MongoDB catalogue (idempotent) |
| `npm run server:migrate` | Apply index migrations (idempotent) |

## Production build commands

| Command | What it does |
| --- | --- |
| `npm run build` | Build the frontend → `dist/` (TypeScript check + Vite build) |
| `npm run server:build` | Compile the backend → `server/dist/` |
| `npm run server:start` | Start the compiled backend (`node server/dist/server.js`) |

Typical production sequence:

```bash
# Backend
cd server && npm ci && cp .env.example .env   # fill real values
npm run migrate && npm run seed
npm run build && npm start

# Frontend (with the API URL baked in)
VITE_API_URL=https://api.sampleseva.example.com npm run build
# serve dist/ from any static host / CDN
```

## Deployment notes

- **Frontend** is a static build (`dist/`) — host it on any static host/CDN. Set `VITE_API_URL` at build time when the API lives on a different origin.
- **Backend** runs `node dist/server.js` behind a reverse proxy (Nginx/Caddy) with **HTTPS**. `trust proxy` is already enabled in production.
- **Cookies** are `HttpOnly; SameSite=Lax; Secure` (Secure only in production). Because of `SameSite=Lax`, the frontend and API should share a registrable domain (e.g. `app.example.com` + `api.example.com`, or serve both behind one domain with a proxy for `/api`).
- **Health check** for load balancers: `GET /api/health` → `200 {"success":true,"database":"connected"}` (returns `503` if the database is unreachable).
- **Secrets**: `MONGODB_URI` and `JWT_SECRET` live only in `server/.env` (git-ignored). `.env.example` files contain placeholders only. Never commit `.env` files.
- **Rate limiting** defaults: 300 req/min globally, 100 req/15 min on auth endpoints. Tighten per environment as needed.
- **Migrations/seeds are idempotent** — safe to run on every deploy.

## API overview

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Catalogue | `GET /api/categories`, `/api/tests`, `/api/tests/:slug`, `/api/tests/:slug/offerings`, `/api/packages`, `/api/labs`, `/api/labs/:slug`, `/api/lab-offerings` |
| Addresses (auth) | `GET/POST /api/addresses`, `PATCH/DELETE /api/addresses/:id`, `PATCH /api/addresses/:id/default` |
| Bookings (auth) | `POST /api/bookings`, `GET /api/bookings`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel` |

All protected endpoints derive the user from the authenticated session — the client never supplies a `userId`, prices are computed server-side, and cross-user access returns `404`.

## License

Private project — no license specified.
