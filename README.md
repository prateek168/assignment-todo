# 📝 Notes App

[![Watch Demo](https://img.shields.io/badge/Watch%20Demo-Video-blue?logo=youtube)](https://drive.google.com/file/d/1kRRDKbv2ClBeils5jZTLqyy5xVxy7sik/view?usp=sharing)

---

## 📽️ Working Video Demo

👉 [Click here to watch the working demo](https://drive.google.com/file/d/1kRRDKbv2ClBeils5jZTLqyy5xVxy7sik/view?usp=sharing)

---

## 🚀 Project Overview

The **Notes App** is a full-stack web application that allows users to securely create, view, update, and delete personal notes. The backend is built with Node.js, Express, and Prisma, while the frontend uses React and TypeScript.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, CSS
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Database:** PostgreSQL (configurable via Prisma)
- **Authentication:** JWT-based & Google OAuth (middleware protected routes)

---

## 🔑 API Routes

### Auth Routes (`/api/auth`)
- `POST   /send-otp`         — Send OTP to user email
- `POST   /verify-otp`       — Verify OTP and login/register
- `GET    /find-user`        — Find user by email
- `GET    /is-loggedin`      — Check if user is logged in
- `GET    /google`           — Google OAuth login
- `GET    /google/callback`  — Google OAuth callback
- `POST   /logout`           — Logout user

### Notes Routes (`/api/notes`)
- `GET    /`                 — Get all notes (auth required)
- `GET    /:id`              — Get a single note by ID (auth required)
- `POST   /`                 — Create a new note (auth required)
- `PUT    /:id`              — Update a note by ID (auth required)
- `DELETE /:id`              — Delete a note by ID (auth required)

---

## ⚙️ Environment Variables

Both frontend and backend require environment variables. See `.sample_env` files in each directory for required keys.

---

## 🏁 Getting Started

### Backend
1. Copy `.sample_env` to `.env` and fill in your values.
2. Install dependencies: `npm install`
3. Run migrations: `npx prisma migrate dev`
4. Start server: `npm run dev`

### Frontend
1. Copy `.sample_env` to `.env` and fill in your values.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`

---

## 📂 Project Structure

- `backend/` — Express API, Prisma, Auth
- `frontend/` — React UI

---

## 📄 License

MIT
