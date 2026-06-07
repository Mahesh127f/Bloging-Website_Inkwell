# Inkwell — A Professional Blog Platform

A full-stack blogging platform where users can write, publish, comment, and like posts. Built with FastAPI + React + Tailwind CSS.

## Features
- User registration, login, JWT auth
- Create, edit, delete blog posts (Markdown support)
- Comment system
- Like/unlike posts
- Tags & filtering
- Search
- Dark mode
- Author profiles
- Featured posts
- Read time estimate
- Seed data with 5 authors and 8 real blog posts
- Live view counter

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite (local) / Supabase PostgreSQL (production) |
| Auth | JWT tokens |
| Deploy Frontend | Vercel (free forever) |
| Deploy Backend | Render (free tier) |

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/inkwell.git
cd inkwell
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:8000
npm run dev
```
Frontend runs at: http://localhost:5173

---

## Deploy to Vercel + Render (Free Forever)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/inkwell.git
git push -u origin main
```

### Step 2 — Deploy Backend to Render
1. Go to https://render.com → Sign up free
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**
6. Wait ~3 minutes. Copy your URL: `https://inkwell-api.onrender.com`

### Step 3 — Deploy Frontend to Vercel
1. Go to https://vercel.com → Sign up free
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Set **Root Directory** to `frontend`
5. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://inkwell-api.onrender.com` ← your Render URL
6. Click **Deploy**
7. Done! Your site is live at `https://inkwell-YOURNAME.vercel.app`

---

## Demo Accounts
All have password: `password123`

| Username | Name |
|---|---|
| alex_morgan | Alex Morgan |
| priya_sharma | Priya Sharma |
| james_okafor | James Okafor |
| sofia_chen | Sofia Chen |
| rajan_patel | Rajan Patel |

---

## Project Structure
```
inkwell/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── crud.py          # Database operations
│   ├── auth.py          # JWT + password hashing
│   ├── database.py      # DB connection
│   ├── seed.py          # Sample data
│   ├── requirements.txt
│   └── render.yaml      # Render deployment config
└── frontend/
    ├── src/
    │   ├── api/         # Axios API client
    │   ├── components/  # Navbar, PostCard, Footer
    │   ├── context/     # Auth & Theme context
    │   ├── pages/       # Home, PostDetail, Write, Profile, Settings, Login, Register
    │   └── utils/       # readTime, timeAgo, etc.
    ├── vercel.json      # Vercel config (SPA routing)
    └── .env.example
```
