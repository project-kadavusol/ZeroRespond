"""
Database connection and session management for ZeroRespond.
Supports PostgreSQL via SQLAlchemy with automated fallback for local dev.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("zerorespond.database")

# Read DATABASE_URL from environment (.env)
# Default for Docker Compose is 'zerorespond-db', default for host dev is 'localhost'
DEFAULT_DB_URL = "postgresql://zerorespond:change-me@zerorespond-db:5432/zerorespond"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

# Safeguard: Expand shell-style variables if passed unexpanded
if "${" in DATABASE_URL:
    user = os.getenv("POSTGRES_USER", "zerorespond")
    password = os.getenv("POSTGRES_PASSWORD", "change-me")
    db_name = os.getenv("POSTGRES_DB", "zerorespond")
    DATABASE_URL = f"postgresql://{user}:{password}@zerorespond-db:5432/{db_name}"

# Fallback from container hostname to localhost if connecting from host
if "zerorespond-db" in DATABASE_URL and os.getenv("RUNNING_IN_DOCKER", "").lower() not in ("true", "1"):
    import socket
    try:
        socket.gethostbyname("zerorespond-db")
    except socket.gaierror:
        DATABASE_URL = DATABASE_URL.replace("zerorespond-db", "localhost")

logger.info(f"Configuring database engine for: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    future=True
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True
)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency yielding a database session per request.
    Closes the session when request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initializes database tables and triggers seed data.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified / created successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL to create tables ({e}). Database features may be offline until PostgreSQL starts.")
