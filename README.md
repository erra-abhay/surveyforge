# SurveyForge

SurveyForge is a robust, dynamic, open-source survey platform built on the MERN stack with highly responsive UI designed for optimal visual excellence.

## Features
- **Account & Identity Management**: Secure JWT authentication and rate limited gateways.
- **Dynamic Survey Engine**: Rich visual builder to design questions (Short text, Long text, Radio single choice, Checkbox multiple choice, Ratings).
- **Public Interactive Form View**: A specialized public endpoint layout ensuring surveys are beautiful to fill out, optimized to yield maximum completion rates.
- **Real-Time Analytics Core**: Visualizations powered by Recharts giving you device insights, aggregated summaries, answer-distribution mapping, and response charts synced in real-time natively via WebSockets (Socket.io).
- **Data Exporting**: Capability to download raw tabular insights per survey as localized `.csv` files.

## Technical Architecture
* **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Recharts, Zustand, Socket.io-client.
* **Backend**: Node.js, Express.js, Mongoose/MongoDB, Socket.io, Json2CSV, PDFKit.
* **Security Middleware**: Helmet, cross-site script cleaning (`xss-clean`), NoSQL injection protections, express-rate-limit tracking.
* **Containerization**: Standardized integration via Docker Compose.

## Local Setup

### Pre-requisites
- Node.js (v18+)
- Docker (for MongoDB orchestration)

### 1. Database
Launch the included `docker-compose.yml` to spin up a localized mongo cluster mapping to `localhost:27017`
```bash
docker-compose up -d mongodb
```

### 2. Backend Server
```bash
cd server
npm install

# Be sure you have a valid .env at server/.env, falling back to:
# MONGODB_URI=mongodb://localhost:27017/surveyforge
# JWT_SECRET=your_jwt_secret_here

npm run dev
```
Starts at `http://localhost:5000`

### 3. Frontend Client
```bash
cd client
npm install
npm run dev
```
Starts at `http://localhost:5173`

Navigate to your frontend URL to see SurveyForge interactively.
