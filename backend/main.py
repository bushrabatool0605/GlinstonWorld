# main.py — REPLACE existing file
# Settings router REMOVED

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.mongodb import connect_db, close_db
from app.db.indexes import create_indexes
from app.api.v1 import auth, products, cart, orders, payments
from app.api.v1 import uploads as uploads_router
from app.api.v1 import admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await create_indexes()
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="E-Commerce REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Validation error handler ───────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    field_errors = []
    for error in exc.errors():
        field = " → ".join(str(loc) for loc in error["loc"] if loc != "body")
        msg   = error["msg"].replace("Value error, ", "").replace("value is not a valid", "Invalid")
        field_errors.append(f"{field}: {msg}" if field else msg)
    message = field_errors[0] if field_errors else "Invalid input. Please check all fields."
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": message, "errors": field_errors},
    )

# ── Global error handler ───────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error. Please try again."},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,            prefix=PREFIX)
app.include_router(products.router,        prefix=PREFIX)
app.include_router(cart.router,            prefix=PREFIX)
app.include_router(orders.router,          prefix=PREFIX)
app.include_router(payments.router,        prefix=PREFIX)
app.include_router(uploads_router.router,  prefix=PREFIX)
app.include_router(admin.router,           prefix=PREFIX)


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "docs": "/docs"}
