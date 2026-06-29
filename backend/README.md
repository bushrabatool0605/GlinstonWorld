# E-Commerce Backend — FastAPI + MongoDB

## Quick Start (5 minutes mein run karo)

### 1. Python virtual environment banao
```bash
cd ecommerce-backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### 2. Dependencies install karo
```bash
pip install -r requirements.txt
```

### 3. Environment variables set karo
```bash
cp .env.example .env
# .env file mein apni values daalo:
# - MONGODB_URL (MongoDB Atlas se copy karo)
# - SECRET_KEY (random 32+ char string)
# - STRIPE_SECRET_KEY (Stripe dashboard se)
```

### 4. Server start karo
```bash
uvicorn main:app --reload --port 8000
```

### 5. API docs dekho
- Swagger UI: http://localhost:8000/docs
- ReDoc:      http://localhost:8000/redoc
- Health:     http://localhost:8000/health

---

## MongoDB Atlas Setup
1. mongodb.com/atlas pe free account banao
2. Cluster create karo (M0 free tier)
3. Database user banao (username + password)
4. Network Access mein apna IP add karo
5. Connect → Drivers → Python → connection string copy karo
6. .env mein MONGODB_URL paste karo

## Stripe Setup (Pakistan)
1. stripe.com pe account banao
2. Pakistan mein Stripe USD charges karta hai
3. Dashboard → Developers → API Keys se keys copy karo
4. Test mode mein kaam karo pehle
5. Webhook: stripe listen --forward-to localhost:8000/api/v1/payments/stripe/webhook

## Project Structure
```
ecommerce-backend/
├── main.py              ← App entry point
├── requirements.txt
├── .env                 ← Secrets (git mein mat daalna)
└── app/
    ├── api/v1/          ← HTTP route handlers
    │   ├── auth.py
    │   ├── products.py
    │   ├── cart.py
    │   ├── orders.py
    │   └── payments.py
    ├── core/            ← Config, JWT, dependencies
    ├── db/              ← MongoDB connection + indexes
    ├── models/          ← Pydantic request/response schemas
    ├── services/        ← Business logic
    ├── repositories/    ← Database queries
    └── tests/           ← Unit tests
```

## Test APIs (Swagger UI se karo)
1. POST /api/v1/auth/register — account banao
2. POST /api/v1/auth/login — token lo
3. Swagger mein "Authorize" button pe token paste karo
4. GET /api/v1/products — products dekho
### New payment flow
- Customer picks: COD / JazzCash / Easypaisa / Card at checkout
- COD → order confirmed immediately, no redirect
- JazzCash / Easypaisa / Card → redirected to Safepay secure page

### New order statuses
`pending` → `confirmed` → `processing` → `shipped` → `out_for_delivery` → `delivered`

### COD specific
- Order confirmed immediately on placement
- Payment status stays "pending" until admin marks as delivered
- Admin panel shows "Pay on delivery" badge