import re
import pytesseract
from PIL import Image
from typing import List
from datetime import date, datetime
from io import BytesIO
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import fitz # PyMuPDF
import schemas
import models
import database

# Create the FastAPI application instance.

app = FastAPI(
    title="Order Management API",
    description="An API to manage orders, extract patient data from PDFs, and log user activity.",
    version="1.0.0"
)

# CORS middleware for frontend-backend communication
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. For production, specify allowed origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to create a log entry.
def create_log(db: Session, user_id: str, action: str):
    """
    Creates a new log entry for a user action.
    """
    timestamp = datetime.now().isoformat()
    db_log = models.Log(user_id=user_id, action=action, timestamp=timestamp)
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# Endpoint to get all logs.
@app.get("/logs/", response_model=List[schemas.Log])
def read_logs(db: Session = Depends(database.get_db)):
    """
    Retrieves all logs from the database.
    """
    logs = db.query(models.Log).all()
    return logs

# Endpoint to get all orders.
@app.get("/orders/", response_model=List[schemas.Order])
def read_orders(db: Session = Depends(database.get_db)):
    """
    Retrieves all orders from the database.
    """
    orders = db.query(models.Order).all()
    create_log(db, user_id="anonymous_user", action="Read all orders")
    return orders

# Endpoint to create a new order.
@app.post("/orders/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    """
    Creates a new order in the database.
    """
    db_order = models.Order(**order.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    action_msg = f"Created order for patient: {order.patient_first_name} {order.patient_last_name}"
    create_log(db, user_id="anonymous_user", action=action_msg)
    
    return db_order

# Endpoint to get a single order by ID.
@app.get("/orders/{order_id}", response_model=schemas.Order)
def read_order(order_id: int, db: Session = Depends(database.get_db)):
    """
    Retrieves a single order by its ID.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    create_log(db, user_id="anonymous_user", action=f"Read order with ID: {order_id}")
    
    return db_order

# Endpoint to update an existing order.
@app.put("/orders/{order_id}", response_model=schemas.Order)
def update_order(order_id: int, order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
    """
    Updates an existing order by its ID.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    for field, value in order.model_dump().items():
        setattr(db_order, field, value)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    create_log(db, user_id="anonymous_user", action=f"Updated order with ID: {order_id}")
    
    return db_order

# Endpoint to delete an order.
@app.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(database.get_db)):
    """
    Deletes an order by its ID.
    """
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(db_order)
    db.commit()
    
    create_log(db, user_id="anonymous_user", action=f"Deleted order with ID: {order_id}")
    
    return

# Endpoint to upload a PDF.
@app.post("/orders/upload_pdf", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def upload_pdf(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    """
    Uploads a PDF, extracts patient data, and creates a new order.
    """
    # Check if the uploaded file is a PDF
    if not file.content_type == 'application/pdf':
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are supported.")

    file_content = BytesIO(file.file.read())
    with fitz.open(stream=file_content.read(), filetype="pdf") as doc:
        text_pages = []
        for page in doc:
            page_text = page.get_text()
            if not page_text.strip():
                # If no text, use OCR
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                ocr_text = pytesseract.image_to_string(img)
                text_pages.append(ocr_text)
            else:
                text_pages.append(page_text)
        text = "\n".join(text_pages)

    # Heuristic extraction for patient name and DOB
    # 1. Find candidate name lines
    name_lines = []
    for line in text.splitlines():
        if re.search(r'(Patient|Name|DOB|Birth)', line, re.IGNORECASE):
            name_lines.append(line)

    # 2. Find all dates in the document
    date_pattern = r'(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})'
    all_dates = re.findall(date_pattern, text)

    # 3. Try to find DOB from lines mentioning birth
    dob = None
    for line in name_lines:
        dob_match = re.search(r'(DOB|Birth)[^\d]*(\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4})', line, re.IGNORECASE)
        if dob_match:
            dob_str = dob_match.group(2)
            try:
                if '-' in dob_str:
                    dob = date.fromisoformat(dob_str)
                else:
                    dob = datetime.strptime(dob_str, "%m/%d/%Y").date()
                break
            except Exception:
                continue

    # 4. Try to find patient name (avoid provider/doctor)
    # Look for lines with 'Patient' or 'Name' but not 'Provider', 'Doctor', etc.
    patient_name = None
    for line in name_lines:
        if re.search(r'(Provider|Doctor|Generated|Report|Prescriber)', line, re.IGNORECASE):
            continue
        # Try to extract name after 'Patient' or 'Name'
        name_match = re.search(r'(Patient|Name)[^A-Za-z]*([A-Z][a-z]+\s[A-Z][a-z]+)', line)
        if name_match:
            patient_name = name_match.group(2)
            break

    # Fallback: Try to find a name in the first few lines
    if not patient_name:
        for line in text.splitlines()[:10]:
            if re.match(r'^[A-Z][a-z]+\s[A-Z][a-z]+$', line.strip()):
                patient_name = line.strip()
                break

    # Split name into first and last
    first_name, last_name = None, None
    if patient_name:
        parts = patient_name.split()
        if len(parts) >= 2:
            first_name, last_name = parts[0], parts[1]

    # Debug logging: print extracted text and candidate lines
    print("--- PDF Extracted Text ---")
    print(text)
    print("--- Candidate Name Lines ---")
    print(name_lines)
    print("--- All Dates Found ---")
    print(all_dates)
    print(f"Extracted patient_name: {patient_name}")
    print(f"Extracted first_name: {first_name}, last_name: {last_name}, dob: {dob}")

    # Error handling with improved message
    if not all([first_name, last_name, dob]):
        error_detail = {
            "message": "Could not robustly extract patient name and date of birth from the PDF.",
            "first_name": first_name,
            "last_name": last_name,
            "dob": str(dob),
            "candidate_name_lines": name_lines,
            "all_dates": all_dates,
            "patient_name": patient_name
        }
        raise HTTPException(status_code=400, detail=error_detail)

    # Create the new order
    order_data = schemas.OrderCreate(patient_first_name=first_name, patient_last_name=last_name, patient_dob=dob)
    db_order = models.Order(**order_data.model_dump())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    action_msg = f"Uploaded and created order from PDF for patient: {first_name} {last_name}"
    create_log(db, user_id="anonymous_user", action=action_msg)

    return db_order