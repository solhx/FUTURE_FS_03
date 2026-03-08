# 🛍️ Urban Nile — Full-Stack E-Commerce Platform

> **Modern Streetwear Inspired by the Nile**  
> A production-ready, full-stack Egyptian clothing brand e-commerce platform built with the MERN stack.

---

## 📋 Table of Contents

- [🚀 Tech Stack](#-tech-stack)
- [✨ Features](#-features)
- [📁 Project Structure](#-project-structure)
- [⚙️ Setup & Installation](#-setup--installation)
- [🔑 Admin Credentials](#-admin-credentials)
- [🌐 API Reference](#-api-reference)
- [📧 Email Authentication Flow](#-email-authentication-flow)
- [🎨 Design System](#-design-system)
- [🚢 Production Deployment](#-production-deployment)
- [❓ Troubleshooting](#-troubleshooting)
- [📝 License](#-license)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **State Management** | React Context (Cart) |
| **HTTP Client** | Axios |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT + OTP Email Verification |
| **Email Service** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet + Rate Limiting + bcryptjs |
| **Image Storage** | Cloudinary |

---

## ✨ Features

### 🛒 Customer Features

- **Hero Section** — Brand showcase with slogan and call-to-action
- **Product Catalog** — Grid display with filtering, search, and sorting
- **Product Details** — Size selector, quantity picker, image gallery
- **Shopping Cart** — Persistent cart (localStorage), add/remove items
- **Checkout Flow** — Egyptian governorates shipping, order summary
- **Order Confirmation** — Status tracker, confirmation email
- **User Authentication** — Register, login, forgot/reset password via OTP

### 🔐 Admin Features

- **OTP Authentication** — Secure email-based login and registration
- **Dashboard** — Statistics overview with recent orders
- **Product Management** — Create, read, update, delete products
- **Order Management** — View all orders, update status
- **Protected Routes** — JWT-secured admin endpoints

---

## 📁 Project Structure

```
urban-nile/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Authentication logic
│   │   │   ├── productController.ts
│   │   │   └── orderController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # JWT verification
│   │   │   └── errorMiddleware.ts # Error handling
│   │   ├── models/
│   │   │   ├── User.ts            # User schema
│   │   │   ├── Product.ts         # Product schema
│   │   │   └── Order.ts           # Order schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   └── orderRoutes.ts
│   │   ├── utils/
│   │   │   ├── emailService.ts    # Nodemailer setup
│   │   │   ├── generateToken.ts   # JWT token generator
│   │   │   └── seeder.ts          # Database seeder
│   │   └── server.ts              # Express app entry
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── ProductCard.tsx
    │   │   ├── CartSidebar.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── context/
    │   │   └── CartContext.tsx     # Cart state management
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── ProductsPage.tsx
    │   │   ├── ProductDetailPage.tsx
    │   │   ├── CartPage.tsx
    │   │   ├── CheckoutPage.tsx
    │   │   ├── OrderConfirmationPage.tsx
    │   │   └── admin/
    │   │       ├── AdminLoginPage.tsx
    │   │       ├── AdminDashboard.tsx
    │   │       ├── AdminProducts.tsx
    │   │       └── AdminOrders.tsx
    │   ├── services/
    │   │   ├── api.ts              # Axios instance
    │   │   ├── authService.ts
    │   │   ├── productService.ts
    │   │   └── orderService.ts
    │   ├── types/
    │   │   └── index.ts            # TypeScript interfaces
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── tsconfig.json
```

---

## ⚙️ Setup & Installation

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | v18+ |
| MongoDB | Local or Atlas |
| npm | Latest |

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/urban-nile.git
cd urban-nile
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file in the `backend` directory:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/urban-nile

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=30d

# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Urban Nile <noreply@urbannile.com>

# Frontend URL
CLIENT_URL=http://localhost:5173

# Admin Credentials (created on seed)
ADMIN_EMAIL=admin@urbannile.com
ADMIN_PASSWORD=Admin@123456
```

#### Gmail App Password Setup

1. Go to [Google Account](https://myaccount.google.com) → **Security**
2. Enable **2-Factor Authentication**
3. Go to **App Passwords** → Generate for "Mail"
4. Use the 16-character password as `EMAIL_PASS`

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

### Step 4: Connect MongoDB

#### Option A — Local MongoDB

```bash
# Start MongoDB service
mongod --dbpath /your/data/path
```

#### Option B — MongoDB Atlas (Cloud)

```text
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/urban-nile
```

### Step 5: Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- ✅ 8 sample products
- ✅ Admin user (`admin@urbannile.com` / `Admin@123456`)

### Step 6: Start the Servers

#### Start Backend (Port 5000)

```bash
cd backend
npm run dev
```

#### Start Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

### Step 7: Open in Browser

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Customer Storefront |
| http://localhost:5173/admin | Admin Dashboard |
| http://localhost:5000/api/health | API Health Check |

---

## 🔑 Admin Credentials

After seeding the database, use these credentials to access the admin panel:

```
Email:    admin@urbannile.com
Password: Admin@123456
```

---

## 🌐 API Reference

### Auth Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register admin + send OTP | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/verify-otp` | Verify email OTP | Public |
| POST | `/api/auth/resend-otp` | Resend verification OTP | Public |
| POST | `/api/auth/forgot-password` | Send password reset OTP | Public |
| POST | `/api/auth/reset-password` | Reset password with OTP | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Product Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | Get all products (+ filter) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/categories` | Get categories | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |

### Order Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | Public |
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/stats` | Get order stats | Admin |
| GET | `/api/orders/:id` | Get single order | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

---

## 📧 Email Authentication Flow

### Registration Flow

```
User Register → OTP Email Sent → Verify OTP → Access Granted
                                          ↓
                                   (Expired?) → Resend OTP
```

### Password Reset Flow

```
Forgot Password → OTP Email Sent → Enter OTP + New Password → Login
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#c9a96e` (Gold) | Buttons, accents, highlights |
| Dark | `#1a1a1a` (Black) | Text, backgrounds |
| Background | `#ffffff` (White) | Main background |
| Sand | `#f9f0e3` (Beige) | Secondary backgrounds |
| Font | Inter + Playfair | Headings: Playfair, Body: Inter |

### Color Palette Preview

| Color | Hex | Preview |
|-------|-----|---------|
| Gold | `#c9a96e` | 🟨 |
| Black | `#1a1a1a` | 🟦 |
| White | `#ffffff` | ⬜ |
| Beige | `#f9f0e3` | 🟧 |

---

## 🚢 Production Deployment

### Backend (Railway / Render / Heroku)

```bash
cd backend
npm run build
npm start
```

### Frontend (Vercel / Netlify)

```bash
cd frontend
npm run build
# Deploy the `dist/` folder
```

**Important:** Update `CLIENT_URL` in backend `.env` to your production frontend URL.

---

## ❓ Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

```bash
# Make sure MongoDB is running
mongod --dbpath /your/data/path

# Or check your connection string in .env
```

#### 2. Email Not Sending

- Verify Gmail App Password is correct
- Ensure 2FA is enabled on your Google account
- Check that App Password is generated for "Mail"

#### 3. CORS Errors

- Verify `CLIENT_URL` in backend `.env` matches your frontend URL
- For development: `http://localhost:5173`

#### 4. JWT Token Expiration

- Token expires in 30 days by default
- Adjust `JWT_EXPIRE` in `.env` if needed

#### 5. Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Need Help?

If you encounter any issues not listed here, please check:
- Backend logs in terminal
- Browser console for frontend errors
- MongoDB Atlas dashboard (if using cloud)

---

## 📝 License

MIT License — Urban Nile © 2024

---

## 🏛️ About

> "Wear the River. Live the Culture."

Urban Nile is a modern Egyptian streetwear brand inspired by the timeless elegance of the Nile River. This e-commerce platform provides a seamless shopping experience for customers and powerful management tools for administrators.

---

## ✅ Quick Start Checklist

Run these commands in order to get everything working:

```bash
# 1. Install backend dependencies
cd backend && npm install

# 2. Install frontend dependencies
cd ../frontend && npm install

# 3. Set up .env file in backend directory
# Copy the template from the section above

# 4. Seed database with products & admin user
cd ../backend && npm run seed

# 5. Start backend (terminal 1)
npm run dev

# 6. Start frontend (terminal 2)
cd ../frontend && npm run dev

# 7. Visit http://localhost:5173

# 8. Admin Login:
#    URL: http://localhost:5173/admin/login
#    Email: admin@urbannile.com
#    Password: Admin@123456
```

---

<p align="center">
  <strong>Built with ❤️ using MERN Stack</strong>
</p>

