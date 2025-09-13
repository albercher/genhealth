from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.orm import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import time

# Create a SQLAlchemy declarative base. This is the foundation for our ORM models.
Base = declarative_base()
engine = create_engine("postgresql://fastapi:fastapi@db:5432/fastapi")

class Order(Base):
    """
    SQLAlchemy model for the 'orders' table in the database.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    patient_first_name = Column(String, index=True)
    patient_last_name = Column(String, index=True)
    patient_dob = Column(Date)

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    action = Column(String)
    timestamp = Column(String)

# Docker Compose does not wait for the database to be fully initialized. Instead, we implement a retry mechanism to handle this.
# This ensures that the tables are created only when the database is ready to accept connections.
max_retries = 10
for i in range(max_retries):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except OperationalError:
        print(f"Database not ready, retrying ({i+1}/{max_retries})...")
        time.sleep(2)
else:
    print("Failed to connect to the database after several attempts.")
    raise
