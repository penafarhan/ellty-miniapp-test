# Calculation Tree Social Network

A social network where users communicate through numbers and mathematical operations.

## Features

- View calculation trees as an unregistered user
- Register and authenticate with username/password
- Start calculation chains with a starting number
- Add operations (addition, subtraction, multiplication, division) to any number in the tree
- Real-time tree visualization

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Frontend**: React, TypeScript, Axios
- **Deployment**: Docker Compose
- **Testing**: Jest, React Testing Library

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Running the Application

1. Clone the repository
2. Run with Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: <http://localhost:3001>
   - Backend API: <http://localhost:3000>

### Development Mode

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Calculations

- `GET /api/calculations` - Get all calculations (tree structure)
- `POST /api/calculations` - Create a starting number
- `POST /api/calculations/:id/operation` - Add an operation to a calculation

## Architecture

- PostgreSQL database stores users and calculations
- JWT-based authentication
- RESTful API design
- Recursive tree structure for calculations
- Component-based React frontend

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```
