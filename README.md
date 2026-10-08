# Digaf Help Desk Management System

Help desk and support request management system for Digaf Microfinance.

## Overview

The Digaf Help Desk Management System is a web-based system for managing internal and external support requests from clients, employees, departments, and support officers.

The system provides centralized request management, assignment, SLA tracking, notifications, reporting, client feedback management, and administration features.

## Features

* Help desk request management
* Request assignment and reassignment
* Departments and branches
* Request categories and keywords
* User management
* Roles and permissions
* SLA policies and business hours
* SLA monitoring and escalation
* In-app and email notifications
* Reports and request statistics
* Client feedback management
* Feedback titles
* System settings
* Maintenance mode
* Authentication rate limiting

## Technology Stack

### Frontend

* React
* Vite
* React Router
* Redux Toolkit
* Tailwind CSS
* Lucide React
* Recharts
* React Datepicker

### Backend

* Node.js
* Express
* Prisma
* PostgreSQL
* JWT authentication
* bcrypt
* Nodemailer
* Helmet
* Express Rate Limit

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL 16
* Nginx

## Project Structure

```text
Digaf Help Desk Management System/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── Dockerfile
│   ├── prisma.config.ts
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
├── .env.docker.example
├── .gitignore
└── README.md
```

## Prerequisites

For Docker-based development, install:

* Git
* Docker Desktop
* WSL 2 on Windows

Node.js and PostgreSQL do not need to be installed on the host machine when running the complete application through Docker.

## Docker Setup

### 1. Configure environment variables

Create your local Docker environment file from the example:

```bash
cp .env.docker.example .env.docker
```

Then update `.env.docker` with your local configuration and required secrets.

> Never commit `.env.docker` to Git. It contains environment-specific configuration and secrets.

### 2. Start the application

From the project root:

```bash
docker compose --env-file .env.docker up -d --build
```

This starts:

* PostgreSQL database
* Backend API
* Frontend application

### 3. Run database migrations

After the containers are running:

```bash
docker exec -it digaf-helpdesk-backend npx prisma migrate deploy
```

### 4. Seed the database

Run the database seed:

```bash
docker exec -it digaf-helpdesk-backend npm run prisma:seed
```

The seed creates the initial departments, branches, roles, permissions, categories, keywords, business hours, SLA policies, system users, client feedback titles, and system settings.

## Application URLs

When running through Docker:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| PostgreSQL  | localhost:5433        |

The backend listens on port `5000` inside the Docker container and is exposed as port `5001` on the host.

PostgreSQL listens on port `5432` inside the Docker container and is exposed as port `5433` on the host.

## Docker Commands

### Check running containers

```bash
docker compose --env-file .env.docker ps
```

### View all service logs

```bash
docker compose --env-file .env.docker logs
```

### View backend logs

```bash
docker compose --env-file .env.docker logs backend
```

### Follow backend logs

```bash
docker compose --env-file .env.docker logs -f backend
```

### Stop the application

```bash
docker compose --env-file .env.docker down
```

### Start and rebuild the application

```bash
docker compose --env-file .env.docker up -d --build
```

### Stop the application and remove Docker volumes

```bash
docker compose --env-file .env.docker down -v
```

> **Warning:** `docker compose down -v` removes the Docker volumes used by the application, including the PostgreSQL data volume. Use this command only when you intentionally want to remove the Docker database data.

## Local Development Without Docker

Docker is recommended for a complete development environment, but the frontend and backend can also be run directly on the host machine.

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

### Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

The frontend uses the following API URL by default for local development:

```text
http://localhost:5000/api
```

The API URL can be changed using the `VITE_API_BASE_URL` environment variable.

## Database

The application uses PostgreSQL.

### Docker database

When running with Docker:

```text
Database: digaf_helpdesk
Host from backend container: db
Port from backend container: 5432
Host from Windows: localhost
Port from Windows: 5433
```

The PostgreSQL data is stored in the Docker volume:

```text
postgres_data
```

The backend connects to the database using the Docker service name:

```text
db:5432
```

This keeps the Docker database separate from any PostgreSQL installation running directly on the Windows host.

## Environment Variables

The Docker environment template is provided in:

```text
.env.docker.example
```

The actual local Docker environment file is:

```text
.env.docker
```

The actual environment file should contain local secrets such as database credentials, JWT secrets, and email credentials.

Never commit real secrets to the repository.

## Security

The application includes several security measures, including:

* JWT-based authentication
* Password hashing with bcrypt
* Authentication rate limiting
* Helmet security headers
* CORS configuration
* HTTP-only authentication cookies
* Role-based access control
* Permission-based authorization
* Environment-based secret configuration

## Important Notes

* Docker PostgreSQL uses host port `5433` to avoid conflicts with PostgreSQL running directly on Windows.
* The backend uses port `5001` on the host when running through Docker.
* The frontend uses port `5173`.
* Database migrations must be applied before using a fresh database.
* Database seeding should be run after migrations on a new database.
* `.env.docker` must not be committed to Git.
* The `frontend/README.md` is the original Vite-generated README and is separate from this project-level README.

## License

This project is developed for Digaf Microfinance.
