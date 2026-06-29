# E-Commerce Frontend — React.js

## Quick Start

### 1. Dependencies install karo
```bash
cd ecommerce-frontend
npm install
```

### 2. Environment setup
`.env` file already hai — sirf Stripe key update karo:
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Backend chalu karo pehle
```bash
# Backend folder mein:
uvicorn main:app --reload --port 8000
```

### 4. Frontend start karo
```bash
npm start
# Opens: http://localhost:3000
```

---

## Pages & Routes
| Route              | Page            | Auth? |
|--------------------|-----------------|-------|
| /                  | Home            | No    |
| /products          | Product Listing | No    |
| /products/:slug    | Product Detail  | No    |
| /login             | Login           | No    |
| /register          | Register        | No    |
| /cart              | Cart            | Yes   |
| /checkout          | Checkout        | Yes   |
| /orders            | My Orders       | Yes   |

## Folder Structure
```
src/
├── App.js                  ← Routes
├── index.js                ← Entry point
├── context/
│   ├── AuthContext.js      ← Login state
│   └── CartContext.js      ← Cart state
├── services/
│   └── api.js              ← All API calls (axios)
├── components/
│   ├── common/             ← Spinner, ProtectedRoute
│   ├── layout/             ← Navbar, Footer
│   └── products/           ← ProductCard
├── pages/                  ← One file per page
├── utils/
│   └── helpers.js          ← formatPrice, formatDate
└── styles/
    └── globals.css         ← Global CSS variables
```

## Test Stripe Payment
Card: `4242 4242 4242 4242`
Expiry: `12/26` · CVV: `123`
# Store Update — 4 Improvements

## Changes in this update

1. Admin-controlled delivery charges (with optional free delivery threshold)
2. Real image upload via Cloudinary (no more URL-only)
3. "Buy Now" button on product cards and detail page
4. Tax removed from checkout (set to 0 by default, admin can change)