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

## Deployment
- The solution can be deployed to any public cloud or server supporting Docker.
- Update environment variables and database connection as needed for production.

## Assessment Notes
- The project demonstrates RESTful API design, database integration, file handling, logging, and deployment best practices.
- The frontend is optional and can be extended for a complete user experience.

## License
MIT
