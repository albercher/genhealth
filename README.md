# GenHealth Assessment Project

## Overview
This is a full-stack application designed for a software engineering assessment. It provides a REST API and a React frontend for managing medical orders, document uploads, and user activity logging. The backend is built with Python (FastAPI), and the frontend uses React. The solution is containerized and can be deployed publicly using Docker Compose.

## Features
- **CRUD Endpoints for Order Entity:**
  - Create, Read, Update, and Delete operations for medical orders via REST API.
- **Database Persistence:**
  - All entities and logs are stored in a PostgreSQL database.
- **Document Upload and Extraction:**
  - Accepts PDF uploads via POST request, extracts patient first name, last name, and date of birth using OCR/text extraction.
- **User Activity Logging:**
  - All user actions are logged to the database for auditing and traceability.
- **Frontend Application:**
  - React-based UI for interacting with the API.
- **Deployment:**
  - Docker Compose setup for easy deployment. Can be hosted on any public cloud or server.

## Architecture
- **Backend:**
  - Python (FastAPI)
  - SQLAlchemy ORM
  - PostgreSQL database
  - Endpoints for CRUD, file upload, and logging
- **Frontend:**
  - React (TypeScript)
  - Connects to backend API
- **Containerization:**
  - Dockerfiles for both backend and frontend
  - `docker-compose.yml` orchestrates services

## Design Decisions
- **Separation of Concerns:**
  - Backend and frontend are decoupled for scalability and maintainability.
- **Database Logging:**
  - All user actions are logged for compliance and debugging.
- **Document Extraction:**
  - Uses OCR/text extraction libraries to handle unknown PDF formats.
- **Deployment:**
  - Docker Compose enables local development and easy cloud migration.

## Setup Instructions
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd genhealth
   ```
2. **Configure environment variables:**
   - Set database credentials in `app/.env` or via Docker Compose.
3. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
4. **Access the application:**
   - Backend API: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

## API Endpoints
- `POST /orders/` - Create order
- `GET /orders/` - List orders
- `GET /orders/{id}` - Get order by ID
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order
- `POST /orders/upload_pdf` - Upload PDF and extract patient info

## Logging
All API actions are logged in the database with user, timestamp, and action details.

## Limitations and Future Improvements

While the core functionality of this project is implemented, there are several areas where further work is needed to reach production-grade quality:

- **Validation:** There is currently no validation on the date field or other user inputs. Robust validation is essential to ensure data integrity and prevent errors.
- **Authentication:** The application does not include a sign-in page. Implementing authentication would allow tracking changes made to Protected Health Information (PHI) and associating actions with actual users, rather than an "anonymous user." This is critical for auditability and compliance.
- **Duplicate Prevention:** There are no constraints to prevent duplicate PDF submissions. Adding logic to detect and prevent duplicates, or allowing multiple PDFs to be uploaded at once, would improve usability and data quality.
- **Security:** Security is a top concern when handling healthcare data. Additional measures such as encryption, secure storage, and proper access controls should be implemented to protect sensitive information.
- **Testing:** Automated testing is currently missing from the project. Implementing comprehensive unit and integration tests for both backend and frontend is essential to ensure reliability, prevent regressions, and provide confidence when making changes.

If more time were available, my focus would be on:
- Adding comprehensive validation for all user inputs
- Implementing user authentication and authorization
- Enforcing constraints to prevent duplicate or erroneous submissions
- Enhancing security throughout the stack, compliant with all HIPAA standards.

These improvements are essential for a production-grade release, especially in a healthcare context.

## License
MIT
