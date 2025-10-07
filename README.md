# Money Manager – Full‑Stack (React + Node.js GraphQL/REST)

This project combines a React frontend with a Node.js backend in a single repo. It supports Splitwise‑type shared expenses and personal accounts. The backend exposes both REST and GraphQL endpoints for authentication, participants, groups, expenses, reports, and analytics. Ready for local development and Vercel deployment.

## Features
- React + Vite frontend with reusable UI components and reports module
- Node.js (Express) backend with Apollo GraphQL and REST routes
- GraphQL schema for Splitwise‑style groups, participants, expenses, splits
- REST routes for auth, participants, groups, expenses, reports, analytics (stubs)
- Environment‑based configuration via `.env`
- CSV and print‑to‑PDF export on the frontend
- Vercel config for serverless API + static frontend build

## Monorepo structure

```
.
├─ server/              # Node.js backend (TypeScript)
│  ├─ src/
│  │  ├─ routes/       # REST routes
│  │  └─ schema/       # GraphQL typeDefs and resolvers
│  ├─ package.json
│  └─ tsconfig.json
├─ src/                 # React frontend (Vite)
└─ package.json         # Root scripts to run both client and server
```

## Prerequisites
- Node.js 18+
- npm 9+

## Installation
```bash
npm install
npm --prefix server install
```

## Environment variables
Create a `.env` file at the repository root (and/or configure on Vercel):

```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=change-me
VITE_API_URL=http://localhost:4000
```

Notes:
- `PORT` controls backend server port.
- `VITE_API_URL` is available to the frontend at build time.
- On Vercel, set these in Project Settings → Environment Variables.

## Local development
Run client and server together:
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend REST: http://localhost:4000/api
- GraphQL: http://localhost:4000/graphql

## Build
```bash
npm run build
```
- Frontend output: `dist/`
- Backend output: `server/dist/`

## Vercel deployment
1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Add env vars in Vercel Project Settings (see above).
4. Vercel uses `vercel.json` to build:
   - `@vercel/node` for `server/src/index.ts`
   - `@vercel/static-build` for the React app (output in `dist`)

## API Overview

### REST (stubs)
- `POST /api/auth/login`, `POST /api/auth/register`
- `GET/POST /api/participants`
- `GET/POST /api/groups`
- `GET/POST /api/expenses`
- `GET /api/reports/summary`
- `GET /api/analytics/trends`

### GraphQL
- Endpoint: `/graphql`
- Schema highlights:
  - Types: `Participant`, `Group`, `Expense`, `ExpenseSplit`
  - Queries: `participants`, `groups`, `expenses`, `reportSummary`
  - Mutations: `createParticipant`, `createGroup`, `addParticipantToGroup`, `createExpense`, `settleSplit`

## Development notes
- The backend currently uses in‑memory data for simplicity; replace with a real DB using `DATABASE_URL`.
- Add authentication middleware (JWT) for protected routes.
- Extend schema/resolvers and REST routes as your data model evolves.
- The frontend `Reports` page demonstrates multiple report styles and CSV/PDF export.

# expence-tracker