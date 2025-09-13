from datetime import date
from pydantic import BaseModel

class OrderBase(BaseModel):
    patient_first_name: str
    patient_last_name: str
    patient_dob: date

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int

    class Config:
        from_attributes = True

class LogBase(BaseModel):
    user_id: str
    action: str
    timestamp: str

class Log(LogBase):
    id: int

    class Config:
        from_attributes = True
