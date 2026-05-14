# Attendance Dashboard

A full-stack attendance management system built with React, Express, SQLite, JWT authentication, and Tailwind CSS.

This application allows teachers and administrators to manage attendance records through a modern web dashboard with authentication, filtering, editing, exporting, and persistent cloud deployment.

---

# Features

- Teacher login authentication
- JWT-protected API routes
- Password hashing with bcrypt
- Attendance CRUD operations
- Dynamic class rosters
- Search and filtering
- CSV export
- Responsive dashboard UI
- Persistent SQLite database
- Cloud deployment with Render + Vercel

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express

## Database

- SQLite

## Authentication

- JWT (jsonwebtoken)
- bcrypt

## Deployment

- Render
- Vercel

---

# Local Development

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/attendance-app.git
cd attendance-app
```

---

# Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```text
http://localhost:3001
```

---

# Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Environment Variables

## Backend

Create a `.env` file or configure environment variables:

```env
JWT_SECRET=your-secret-key
DB_PATH=./attendance.db
```

---

# Demo Login Accounts

## Teacher

```text
username: teacher
password: teacher123
```

## Admin

```text
username: admin
password: admin123
```

---

# Live Demo

## Frontend

```text
https://YOUR-VERCEL-URL.vercel.app
```

## Backend

```text
https://attendance-app-g1g2.onrender.com
```

---

# Project Structure

```text
attendance-app/
│
├── backend/
│   ├── server.js
│   ├── attendance.db
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

# API Routes

## Authentication

### Login

```http
POST /login
```

---

## Attendance

### Get Attendance Records

```http
GET /attendance
```

### Create Attendance Records

```http
POST /attendance
```

### Update Attendance Record

```http
PUT /attendance/:id
```

### Delete Attendance Record

```http
DELETE /attendance/:id
```

---

# Security Features

- JWT authentication
- Protected API routes
- Password hashing with bcrypt
- CORS configuration for deployed frontend
- Environment variable support

---

# Deployment

## Backend Deployment

Hosted on Render.

### Render Configuration

Build command:

```bash
npm install --build-from-source=sqlite3
```

Start command:

```bash
node server.js
```

Persistent disk mount:

```text
/var/data
```

---

## Frontend Deployment

Hosted on Vercel.

### Vercel Configuration

Root directory:

```text
frontend
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

---

# Future Improvements

- PostgreSQL migration
- Prisma ORM integration
- Role-based authorization
- Attendance analytics dashboard
- Charts and reporting
- Mobile responsiveness improvements
- Parent/student portals
- Docker support
- Automated testing
- CI/CD pipeline integration

---

# Screenshots

_Add screenshots here later._

Example:

```md
![Dashboard Screenshot](./screenshots/dashboard.png)
```

---

# Author

Built by Yonnas Abraham.
