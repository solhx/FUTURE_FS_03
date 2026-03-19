<div align="center">

# 🛍️ Urban Nile

### Modern Streetwear Inspired by the Nile

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?logo=netlify)
![Render](https://img.shields.io/badge/API-Render-46E3B7?logo=render)

**[🔗 Live Demo](https://urban-nile.netlify.app)**

</div>

---

## 📋 Table of Contents
- [📊 Project Overview](#-project-overview)
- [🚀 Core Features](#-core-features)
- [🔧 Tech Stack](#-tech-stack)
- [📂 File Structure](#-file-structure)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🧪 API Endpoints](#-api-endpoints)
- [📈 Performance Metrics](#-performance-metrics)
- [🔒 Security](#-security)
- [📧 Email Flow](#-email-flow)
- [🚢 Deployment](#-deployment)
- [❓ Troubleshooting](#-troubleshooting)

---

## 📊 Project Overview

| | |
|---|---|
| **Name** | Urban Nile — Egyptian Streetwear E-Commerce |
| **Structure** | Monorepo (`e-commerce/backend` + `e-commerce/frontend`) |
| **Status** | ✅ Production-ready (cold start fixed, security hardened) |
| **Backend Port** | `3000` |
| **Frontend Port** | `5173` (Vite dev server) |
| **Admin Credentials** | `admin@urbannile.com` / `Admin@123456` |

---

## 🚀 Core Features

| Feature | Status | Details |
|---|---|---|
| Product Catalog | ✅ Complete | Filter / search / sort, image gallery |
| Shopping Cart | ✅ Complete | localStorage persistent, quantity management |
| Checkout | ✅ Complete | Egypt governorates shipping |
| Admin Dashboard | ✅ Complete | Products/Orders CRUD with image upload |
| Auth System | ✅ Complete | JWT + Email OTP verification / reset |
| Order Management | ✅ Complete | Status tracking, admin updates |
| Responsive Design | ✅ Complete | Desktop / Tablet / Mobile (Tailwind) |

---

## 🔧 Tech Stack

### Backend — `e-commerce/backend`

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18 + Express 4.18.2 |
| **Language** | TypeScript |
| **Database** | MongoDB Atlas + Mongoose 8.0.3 |
| **Auth** | JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3 |
| **Email** | Nodemailer 6.9.7 / Brevo HTTP API |
| **Images** | Multer 1.4.5 + Cloudinary |
| **Security** | Helmet 7.1.0 + express-rate-limit 7.1.5 |

### Frontend — `e-commerce/frontend`

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5.3.2 |
| **Build** | Vite 5.x |
| **Styling** | Tailwind CSS + Framer Motion |
| **HTTP** | Axios |
| **Icons** | Lucide React |

---

## 📂 File Structure

```
FUTURE_FS_03/
├── README.md
├── TODO.md                      # Fix tracker (cold start ✅)
└── e-commerce/
    ├── backend/src/             # 30+ files
    │   ├── server.ts            # Fixed: async DB, trust proxy
    │   ├── controllers/
    │   │   ├── authController.ts
    │   │   ├── productController.ts
    │   │   └── orderController.ts
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Product.ts
    │   │   ├── Order.ts
    │   │   └── PendingUser.ts
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── productRoutes.ts
    │   │   └── orderRoutes.ts
    │   └── utils/
    │       ├── emailService.ts
    │       ├── multer.ts
    │       ├── seeder.ts
    │       └── generateToken.ts
    └── frontend/src/            # 25+ components/pages/services
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── ProductsPage.tsx
        │   ├── CheckoutPage.tsx
        │   └── admin/
        │       ├── Dashboard.tsx
        │       ├── Products.tsx
        │       └── Orders.tsx
        ├── context/
        │   ├── AuthContext.tsx
        │   └── CartContext.tsx
        └── services/
            ├── api.ts
            ├── authService.ts
            ├── productService.ts
            └── orderService.ts
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Brevo account (free tier)

### Step 1 — Clone
```bash
git clone https://github.com/your-username/urban-nile.git
cd FUTURE_FS_03
```

### Step 2 — Backend
```bash
cd e-commerce/backend
npm install
cp .env.example .env   # Fill in your values
npm run seed           # Seed DB with products & admin
npm run dev            # http://localhost:3000
```

### Step 3 — Frontend
```bash
cd e-commerce/frontend
npm install
npm run dev            # http://localhost:5173
```

### Step 4 — Environment Variables

Create `e-commerce/backend/.env`:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=your_mongodb_atlas_uri

JWT_SECRET=supersecretkeychangeproduction
JWT_EXPIRE=30d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=gmail_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
```

> ⚠️ **Never commit real credentials to GitHub. Use `.env.example` with empty values.**

---

## 🧪 API Endpoints

### Public — `100 req / 15 min`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | DB status check |
| GET | `/api/products` | List + filter / search / sort |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/categories` | Get all categories |

### Auth — `50 req / 15 min`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/register-customer` | Register + send OTP |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/me` | Get current user |

### Admin — JWT Protected

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get all orders |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/stats` | Sales statistics |

---

## 📈 Performance Metrics

| Metric | Before | After |
|---|---|---|
| Server Startup | 10–30s | 1.5ms |
| DB Connection | Blocking | Async retry |
| Auth Rate Limit | 10 req / 15 min | 50 req / 15 min |
| Health Check | Basic | DB-aware |
| Email on Render | ❌ SMTP blocked | ✅ Brevo HTTP API |
| CORS on Netlify | ❌ Blocked | ✅ Fixed |
| Render Cold Start | ⏳ 30–60s | ✅ Keep-alive ping |
| Proxy Warning | ❌ ERR_ERL | ✅ trust proxy = 1 |

---

## 🔒 Security

- ✅ Helmet HTTP headers
- ✅ Rate limiting — general (100/15min) + auth (50/15min)
- ✅ bcrypt password hashing
- ✅ JWT auth middleware on all admin routes
- ✅ Input validation
- ✅ CORS origin whitelist
- ✅ Environment secrets never committed to Git

---

## 📧 Email Flow

```
Register ──► OTP Email ──► Verify ──► Access ✅
                  │
              Expired? ──► Resend OTP

Forgot Password ──► OTP Email ──► Reset ──► Login ✅
```

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. Create **New Web Service** on Render → connect repo
3. Set **Root Directory** to `e-commerce/backend`
4. **Build command:** `npm install && npm run build`
5. **Start command:** `npm start`
6. Add all environment variables
7. Deploy ✅

### Frontend → Netlify

1. Set **Base directory** to `e-commerce/frontend`
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`
5. Deploy ✅

### GitHub Safety Checklist

```bash
# 1. Make sure .env is in .gitignore
echo ".env" >> .gitignore

# 2. Create .env.example without real values
cp .env .env.example   # then clear the real values

# 3. Verify no secrets in git history
git log --all --full-history -- .env
```

---

## 🚀 Live URLs

| Service | URL |
|---|---|
| 🛍️ Store | https://urban-nile.netlify.app |
| 🔐 Admin Panel | https://urban-nile.netlify.app/admin |
| 🖥️ Local Store | http://localhost:5173 |
| 🔐 Local Admin | http://localhost:5173/admin |
| ⚙️ Local API | http://localhost:3000/api/health |
| 🖼️ Local Images | http://localhost:3000/uploads/*.jpg |

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| Email not sending | Check `BREVO_API_KEY` or `EMAIL_PASS` in `.env` |
| CORS error | Verify `CLIENT_URL` matches frontend URL exactly |
| Rate limit hit | Wait 15 minutes and retry |
| Slow first load | Normal — Render free tier has cold starts |
| DB not connecting | Check `MONGODB_URI` and Atlas IP whitelist (`0.0.0.0/0`) |
| Images not loading | Verify Cloudinary env vars are set on Render |
| Admin login fails | Run `npm run seed` to recreate admin account |

---

<div align="center">

MIT © 2026 Urban Nile — Built with HOSS using MERN Stack

*"Wear the River. Live the Culture."*

</div>