# Job Tracker

A full-stack app for tracking job applications: sign up, log in, and manage every application (company, role, status, applied date, notes).

- **Live app:** `<add your Vercel/Netlify URL>`
- **Live API:** `<add your Render URL>/api/health`
- **Demo login:** `demo@jobtracker.dev` / `Demo@1234`

## Tech stack

| Layer | Tools |
| --- | --- |
| Front end | React (Vite), React Router, Redux Toolkit, plain CSS (responsive) |
| API | Node.js, Express, `express.Router`, zod validation, central error middleware |
| Auth | bcrypt hashing (`bcryptjs`) + JWT (7-day expiry) |
| Database | MongoDB (Atlas) with Mongoose: `users` and `applications` collections |

## Features

- Sign up and log in; passwords are hashed, sessions use a JWT stored in `localStorage`
- Each user only sees and edits their own applications (every query is scoped by `user`)
- Dashboard: count per status, filter by status, search by company
- Add and edit pages with controlled forms and validation (client and server)
- Loading and error states for every API call
- Works on phones and laptops

## Project structure

```
server/   Express API (src/routes, src/models, src/middleware)
client/   React app (src/pages, src/components, src/store)
```

## Run locally

Requirements: Node 18+, a MongoDB connection string (free [Atlas](https://www.mongodb.com/atlas) cluster works).

```bash
# API
cd server
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # creates the demo user and sample applications
npm run dev                 # http://localhost:5000

# Front end (new terminal)
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # http://localhost:5173
```

## API routes

All `/api/applications` routes need the header `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account. Body: `name`, `email`, `password` (8+ chars). Returns `token` and `user` |
| POST | `/api/auth/login` | Log in. Body: `email`, `password`. Returns `token` and `user` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/applications` | List your applications. Query: `status`, `search` (company) |
| GET | `/api/applications/stats` | Count per status and the total |
| GET | `/api/applications/:id` | One application |
| POST | `/api/applications` | Create. Body: `company`, `role`, `status`, `appliedDate`, `notes` |
| PUT | `/api/applications/:id` | Update (same body as create) |
| DELETE | `/api/applications/:id` | Delete |
| GET | `/api/health` | Health check |

`status` is one of `Wishlist`, `Applied`, `Interview`, `Offer`, `Rejected`.
Errors always come back as JSON: `{ "message": "...", "errors": [{ "field", "message" }] }`.

## Deploy

1. **Database:** create a MongoDB Atlas cluster, add a database user, and allow access from anywhere (`0.0.0.0/0`) under Network Access.
2. **API on Render:** New Web Service, root directory `server`, build command `npm install`, start command `npm start`. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your front-end URL, no trailing slash).
3. **Front end on Vercel or Netlify:** root directory `client`, build command `npm run build`, output directory `dist`. Environment variable: `VITE_API_URL=https://<your-render-service>.onrender.com/api`. SPA rewrites are already configured (`vercel.json`, `public/_redirects`).
4. **Demo user:** run `npm run seed` locally with the production `MONGO_URI` in `server/.env`.

Render's free tier sleeps when idle, so the first request can take about 30 seconds.
