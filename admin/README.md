# E-Commerce Admin Panel — React.js

## Quick Start

### 1. Install dependencies
```bash
cd ecommerce-admin
npm install
```

### 2. Make sure backend is running first
```bash
# In your backend folder:
uvicorn main:app --reload --port 8000
```

### 3. Add the admin users endpoint to your backend
Copy the contents of `BACKEND_ADDITION.py` into your backend:
- Create `app/api/v1/admin.py` with its content
- Register in `main.py`: `app.include_router(admin.router, prefix=PREFIX)`

### 4. Create an admin account
Run this in MongoDB Atlas or via mongo shell:
```js
db.users.updateOne(
  { email: "admin@yourstore.com" },
  { $set: { role: "admin" } }
)
```
Or register normally at http://localhost:3000/register then update role in Atlas.

### 5. Start the admin panel
```bash
npm start
# Opens at: http://localhost:3001
```

### 6. Login
- URL: http://localhost:3001/login
- Use your admin email and password

---

## Features

| Page       | What you can do                                      |
|------------|------------------------------------------------------|
| Dashboard  | Revenue chart, order stats, low stock alerts         |
| Products   | Add, edit, delete products with full form validation |
| Orders     | View all orders, expand details, update status       |
| Customers  | Browse registered users, see verification status     |

## Running all 3 together
```
Terminal 1: cd ecommerce-backend  && uvicorn main:app --reload --port 8000
Terminal 2: cd ecommerce-frontend && npm start   # port 3000
Terminal 3: cd ecommerce-admin    && npm start   # port 3001
```
