from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection details from docker-compose.yml
SQLALCHEMY_DATABASE_URL = "postgresql://fastapi:fastapi@db:5432/fastapi"

# Create the SQLAlchemy engine.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a session local class. This will be used to create session instances.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a declarative base for the ORM models.
Base = declarative_base()

def get_db():
    """
    Dependency to get a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
