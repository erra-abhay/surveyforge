# SURVEYFORGE — MASTER AGENT BUILD PROMPT
## Full-Stack MERN Survey Platform with Real-Time Analytics
### Version: 1.0.0 | Target: Production-Ready | Estimated LOC: 8,000+

---

> **AGENT INSTRUCTIONS**: This is a complete, self-contained build specification. Read the entire document before writing a single line of code. Every section is mandatory unless marked `[OPTIONAL]`. Implement features in the order listed. After completing each major section, perform a self-review checklist before proceeding. Do not skip steps, do not hallucinate APIs, do not use deprecated packages. When in doubt, refer back to this document.

---

## TABLE OF CONTENTS

1. [Project Philosophy & Vision](#1-project-philosophy--vision)
2. [Technology Stack & Versions](#2-technology-stack--versions)
3. [Repository & Folder Structure](#3-repository--folder-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Design — MongoDB Schemas](#5-database-design--mongodb-schemas)
6. [Backend — Node.js / Express.js Server](#6-backend--nodejs--expressjs-server)
7. [Backend — Authentication System](#7-backend--authentication-system)
8. [Backend — Survey API Routes](#8-backend--survey-api-routes)
9. [Backend — Response Collection API](#9-backend--response-collection-api)
10. [Backend — Analytics API](#10-backend--analytics-api)
11. [Backend — Export API](#11-backend--export-api)
12. [Backend — Middleware Stack](#12-backend--middleware-stack)
13. [Frontend — React App Architecture](#13-frontend--react-app-architecture)
14. [Frontend — Design System & Theme](#14-frontend--design-system--theme)
15. [Frontend — Authentication Pages](#15-frontend--authentication-pages)
16. [Frontend — Survey Builder](#16-frontend--survey-builder)
17. [Frontend — Survey Respondent View](#17-frontend--survey-respondent-view)
18. [Frontend — My Surveys Dashboard](#18-frontend--my-surveys-dashboard)
19. [Frontend — Analytics Dashboard](#19-frontend--analytics-dashboard)
20. [Frontend — Shared Components Library](#20-frontend--shared-components-library)
21. [Real-Time Features — WebSockets](#21-real-time-features--websockets)
22. [Export Features — CSV & PDF](#22-export-features--csv--pdf)
23. [Security Implementation](#23-security-implementation)
24. [Error Handling Strategy](#24-error-handling-strategy)
25. [Testing Requirements](#25-testing-requirements)
26. [Performance Optimization](#26-performance-optimization)
27. [Deployment Configuration](#27-deployment-configuration)
28. [Final Integration Checklist](#28-final-integration-checklist)

---

## 1. PROJECT PHILOSOPHY & VISION

### 1.1 What You Are Building

SurveyForge is a **production-grade, full-stack survey platform** that enables any user to create rich surveys, distribute them via unique shareable links, collect responses from unlimited participants (no login required), and visualize results through an interactive real-time analytics dashboard.

Think of it as a self-hosted, open-source Google Forms with a powerful analytics layer on top.

### 1.2 Core User Personas

**Persona A — The Survey Creator (Authenticated)**
- A college professor, startup founder, or HR manager
- Creates surveys in under 5 minutes
- Monitors live response counts from the dashboard
- Exports results for reports

**Persona B — The Respondent (Anonymous / Public)**
- A student, customer, or employee
- Accesses survey via a shared link
- Fills out the form in under 2 minutes
- No account needed
- Receives a confirmation on submission

**Persona C — The Admin (Optional)**
- Platform administrator
- Can view all surveys and users
- Can deactivate or delete surveys

### 1.3 Design Principles

1. **Zero friction for respondents** — Filling a survey must require zero sign-ups.
2. **Instant feedback for creators** — The dashboard must update in near-real-time.
3. **Mobile-first** — All views must be fully usable on a 375px wide screen.
4. **Data integrity** — Every response must be validated on both client and server.
5. **Graceful degradation** — If WebSockets fail, fall back to polling every 30s.
6. **Security by default** — No sensitive data in URLs, all inputs sanitized.

---

## 2. TECHNOLOGY STACK & VERSIONS

### 2.1 Backend

| Package | Version | Purpose |
|---------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express.js | 4.18.x | HTTP framework |
| MongoDB | 7.x | Primary database |
| Mongoose | 8.x | ODM for MongoDB |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.4.x | Password hashing |
| cors | 2.8.x | Cross-origin resource sharing |
| dotenv | 16.x | Environment variables |
| helmet | 7.x | HTTP security headers |
| express-rate-limit | 7.x | Rate limiting |
| express-validator | 7.x | Input validation |
| socket.io | 4.x | WebSocket real-time |
| uuid | 9.x | Unique survey URL tokens |
| fast-csv | 5.x | CSV export |
| pdfkit | 0.15.x | PDF export |
| morgan | 1.10.x | HTTP request logging |
| compression | 1.7.x | Gzip compression |
| mongoose-paginate-v2 | 1.x | Pagination plugin |

### 2.2 Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.x | UI framework |
| React DOM | 18.x | DOM rendering |
| React Router DOM | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Charts and data visualization |
| Socket.io-client | 4.x | WebSocket client |
| React Hot Toast | 2.x | Toast notifications |
| React Beautiful DnD | 13.x | Drag-and-drop question ordering |
| date-fns | 3.x | Date formatting |
| Framer Motion | 11.x | Animations |
| Lucide React | 0.x | Icon library |
| Tailwind CSS | 3.x | Utility-first styling |

### 2.3 Dev Tools

| Tool | Purpose |
|------|---------|
| Vite | Frontend build tool |
| Nodemon | Backend hot-reload |
| ESLint | Linting |
| Prettier | Code formatting |
| concurrently | Run client+server together |
| Jest | Backend testing |
| React Testing Library | Frontend testing |

---

## 3. REPOSITORY & FOLDER STRUCTURE

### 3.1 Root Structure

```
surveyforge/
├── client/                    # React frontend
├── server/                    # Node.js backend
├── .gitignore
├── .env.example
├── package.json               # Root package.json (scripts only)
├── README.md
└── docker-compose.yml         # [OPTIONAL] Docker setup
```

### 3.2 Server Folder Structure (Complete)

```
server/
├── src/
│   ├── config/
│   │   ├── database.js        # MongoDB connection logic
│   │   ├── socket.js          # Socket.io initialization
│   │   └── constants.js       # App-wide constants
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Survey.model.js
│   │   ├── Question.model.js  # Embedded, but defined separately
│   │   └── Response.model.js
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── survey.routes.js
│   │   ├── response.routes.js
│   │   ├── analytics.routes.js
│   │   └── export.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── survey.controller.js
│   │   ├── response.controller.js
│   │   ├── analytics.controller.js
│   │   └── export.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   ├── rateLimit.middleware.js
│   │   ├── validate.middleware.js
│   │   └── errorHandler.middleware.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── survey.validator.js
│   │   └── response.validator.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   ├── hash.utils.js
│   │   ├── ipUtils.js
│   │   ├── csvExport.utils.js
│   │   └── pdfExport.utils.js
│   └── app.js                 # Express app setup
├── server.js                  # Entry point (HTTP + Socket.io)
├── package.json
└── .env
```

### 3.3 Client Folder Structure (Complete)

```
client/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── api/
│   │   ├── axios.config.js    # Axios instance with interceptors
│   │   ├── auth.api.js
│   │   ├── survey.api.js
│   │   ├── response.api.js
│   │   └── analytics.api.js
│   ├── assets/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PageWrapper.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── survey/
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── QuestionEditor.jsx
│   │   │   ├── QuestionTypeSelector.jsx
│   │   │   ├── OptionEditor.jsx
│   │   │   ├── SurveyCard.jsx
│   │   │   └── ShareModal.jsx
│   │   ├── response/
│   │   │   ├── MultipleChoiceField.jsx
│   │   │   ├── RatingField.jsx
│   │   │   ├── ShortTextField.jsx
│   │   │   └── ResponseProgress.jsx
│   │   └── analytics/
│   │       ├── PieChartWidget.jsx
│   │       ├── BarChartWidget.jsx
│   │       ├── TrendLineChart.jsx
│   │       ├── StatCard.jsx
│   │       ├── ResponseTable.jsx
│   │       └── LiveIndicator.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSurveys.js
│   │   ├── useAnalytics.js
│   │   ├── useSocket.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SurveyBuilder.jsx
│   │   ├── SurveyEdit.jsx
│   │   ├── SurveyRespond.jsx    # Public page
│   │   ├── SurveyThankYou.jsx   # Public page
│   │   ├── Analytics.jsx
│   │   ├── NotFound.jsx
│   │   └── ServerError.jsx
│   ├── router/
│   │   ├── AppRouter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   ├── store/
│   │   ├── useAuthStore.js      # Zustand or Context
│   │   └── useSurveyStore.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── tailwind.css
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── chartHelpers.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 4. ENVIRONMENT CONFIGURATION

### 4.1 Server `.env` File

Create `server/.env` with ALL of the following variables. Never commit this file.

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/surveyforge
MONGODB_URI_TEST=mongodb://localhost:27017/surveyforge_test

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_also_32_chars
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Email (for future features)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Survey Config
MAX_QUESTIONS_PER_SURVEY=50
MAX_OPTIONS_PER_QUESTION=20
SURVEY_LINK_BASE_URL=http://localhost:5173/s
```

### 4.2 Client `.env` File

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=SurveyForge
VITE_APP_VERSION=1.0.0
```

### 4.3 Root `package.json` Scripts

```json
{
  "name": "surveyforge",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "build": "cd client && npm run build",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install",
    "test": "cd server && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

---

## 5. DATABASE DESIGN — MONGODB SCHEMAS

### 5.1 User Schema

**File**: `server/src/models/User.model.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: survey count
userSchema.virtual('surveyCount', {
  ref: 'Survey',
  localField: '_id',
  foreignField: 'creator',
  count: true,
});

// Pre-save hook: hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: toSafeObject (strip sensitive fields)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

---

### 5.2 Survey Schema

**File**: `server/src/models/Survey.model.js`

```javascript
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Sub-schema: Option (for multiple choice)
const optionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Option text cannot exceed 500 characters'],
  },
  order: { type: Number, default: 0 },
});

// Sub-schema: Question
const questionSchema = new mongoose.Schema({
  _id: { type: String, default: () => uuidv4() },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question text cannot exceed 1000 characters'],
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'rating', 'short_text', 'yes_no', 'checkbox'],
    required: [true, 'Question type is required'],
  },
  required: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  options: [optionSchema], // Only for multiple_choice, yes_no, checkbox
  ratingScale: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 5 },
    minLabel: { type: String, default: 'Poor' },
    maxLabel: { type: String, default: 'Excellent' },
  },
  placeholder: {
    type: String,
    default: 'Your answer here...',
  },
});

// Main Survey schema
const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (v) {
          return v.length >= 1 && v.length <= 50;
        },
        message: 'A survey must have between 1 and 50 questions',
      },
    },
    shareToken: {
      type: String,
      unique: true,
      default: () => uuidv4().replace(/-/g, '').substring(0, 12),
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'archived'],
      default: 'draft',
    },
    settings: {
      allowAnonymous: { type: Boolean, default: true },
      preventDuplicates: { type: Boolean, default: false },
      duplicateCheckMethod: {
        type: String,
        enum: ['ip', 'cookie', 'login'],
        default: 'ip',
      },
      showProgressBar: { type: Boolean, default: true },
      showQuestionNumbers: { type: Boolean, default: true },
      randomizeQuestions: { type: Boolean, default: false },
      closeDate: { type: Date, default: null },
      maxResponses: { type: Number, default: null }, // null = unlimited
      thankYouMessage: {
        type: String,
        default: 'Thank you for your response!',
      },
      theme: {
        type: String,
        enum: ['default', 'minimal', 'dark', 'ocean', 'sunset'],
        default: 'default',
      },
    },
    stats: {
      totalResponses: { type: Number, default: 0 },
      lastResponseAt: { type: Date, default: null },
      completionRate: { type: Number, default: 0 },
    },
    tags: [{ type: String, trim: true, maxlength: 50 }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for fast lookups
surveySchema.index({ shareToken: 1 });
surveySchema.index({ creator: 1, status: 1 });
surveySchema.index({ createdAt: -1 });
surveySchema.index({ 'stats.totalResponses': -1 });

// Virtual: isExpired
surveySchema.virtual('isExpired').get(function () {
  if (!this.settings.closeDate) return false;
  return new Date() > new Date(this.settings.closeDate);
});

// Virtual: isAcceptingResponses
surveySchema.virtual('isAcceptingResponses').get(function () {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  if (
    this.settings.maxResponses &&
    this.stats.totalResponses >= this.settings.maxResponses
  )
    return false;
  return true;
});

// Pre-save: order questions by order field
surveySchema.pre('save', function (next) {
  this.questions.sort((a, b) => a.order - b.order);
  next();
});

module.exports = mongoose.model('Survey', surveySchema);
```

---

### 5.3 Response Schema

**File**: `server/src/models/Response.model.js`

```javascript
const mongoose = require('mongoose');

// Sub-schema: Individual answer
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String, // Snapshot at time of response
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'rating', 'short_text', 'yes_no', 'checkbox'],
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // String for text, Number for rating, Array for checkbox
    required: false,
  },
  selectedOptions: [
    {
      optionId: String,
      optionText: String,
    },
  ],
  skipped: {
    type: Boolean,
    default: false,
  },
});

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
    metadata: {
      ipAddress: {
        type: String,
        select: false, // Private — only accessible explicitly
      },
      userAgent: {
        type: String,
        select: false,
      },
      sessionId: {
        type: String, // Cookie-based deduplication
        select: false,
      },
      startedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: {
        type: Date,
      },
      completionTimeSeconds: {
        type: Number, // How long the respondent took
      },
      referrer: String,
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
      },
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
responseSchema.index({ survey: 1, createdAt: -1 });
responseSchema.index({ survey: 1, 'metadata.ipAddress': 1 });
responseSchema.index({ survey: 1, respondent: 1 });
responseSchema.index({ createdAt: -1 });

// Post-save hook: Update survey stats
responseSchema.post('save', async function (doc) {
  try {
    const Survey = mongoose.model('Survey');
    await Survey.findByIdAndUpdate(doc.survey, {
      $inc: { 'stats.totalResponses': 1 },
      $set: { 'stats.lastResponseAt': doc.createdAt },
    });
  } catch (err) {
    console.error('Failed to update survey stats:', err);
  }
});

module.exports = mongoose.model('Response', responseSchema);
```

---

## 6. BACKEND — NODE.JS / EXPRESS.JS SERVER

### 6.1 Database Connection

**File**: `server/src/config/database.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are defaults in Mongoose 8.x, listed for clarity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
```

### 6.2 Express App Setup

**File**: `server/src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Adjust for production
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Compression ──────────────────────────────────────────────────────────
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
```

### 6.3 Server Entry Point with Socket.io

**File**: `server/server.js`

```javascript
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Connect to database then start server
const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`
🚀 SurveyForge Server Running
─────────────────────────────
🌐 URL:         http://localhost:${PORT}
📊 API:         http://localhost:${PORT}/api/v1
❤️  Health:      http://localhost:${PORT}/health
🌍 Environment: ${process.env.NODE_ENV}
─────────────────────────────
    `);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
};

startServer();
```

---

## 7. BACKEND — AUTHENTICATION SYSTEM

### 7.1 JWT Utilities

**File**: `server/src/utils/jwt.utils.js`

```javascript
const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
```

### 7.2 Auth Middleware

**File**: `server/src/middleware/auth.middleware.js`

```javascript
const { verifyAccessToken } = require('../utils/jwt.utils');
const User = require('../models/User.model');

/**
 * Protect routes — requires valid JWT
 */
const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database (exclude sensitive fields)
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't fail if absent
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshToken');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Silent fail — optionalAuth doesn't block
  }
  next();
};

/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
```

### 7.3 Auth Controller

**File**: `server/src/controllers/auth.controller.js`

Implement the following functions with full logic:

#### `register(req, res, next)`
- Validate: name, email, password (min 8 chars, at least 1 uppercase, 1 number)
- Check if email already exists → 409 Conflict
- Create new User document
- Generate access + refresh tokens
- Save refreshToken to user document
- Update `lastLogin`
- Return: `{ success: true, data: { user: safeUser, accessToken, refreshToken } }`

#### `login(req, res, next)`
- Validate email + password present
- Find user by email (include password field with `.select('+password')`)
- If not found → 401 with generic message (don't reveal whether email exists)
- Compare passwords using `user.comparePassword()`
- If wrong → 401
- Generate access + refresh tokens
- Update `lastLogin` and save refreshToken
- Return: `{ success: true, data: { user: safeUser, accessToken, refreshToken } }`

#### `refreshToken(req, res, next)`
- Extract refreshToken from request body
- Verify using `verifyRefreshToken()`
- Find user by id + verify stored refreshToken matches
- Generate new access token
- Return: `{ success: true, data: { accessToken } }`

#### `logout(req, res, next)`
- Protected route
- Clear refreshToken from user document
- Return: `{ success: true, message: 'Logged out successfully' }`

#### `getMe(req, res, next)`
- Protected route
- Populate `surveyCount` virtual
- Return current user data

#### `updateProfile(req, res, next)`
- Protected route
- Allowed fields: name, preferences
- Return updated user

#### `changePassword(req, res, next)`
- Protected route
- Verify current password
- Validate new password strength
- Hash and save new password
- Invalidate all sessions by clearing refreshToken

---

## 8. BACKEND — SURVEY API ROUTES

### 8.1 Route Definitions

**File**: `server/src/routes/survey.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const surveyController = require('../controllers/survey.controller');
const { validateSurvey } = require('../validators/survey.validator');

// ─── Creator Routes (requires auth) ──────────────────────────────────────
router.post('/', protect, validateSurvey, surveyController.createSurvey);
router.get('/my', protect, surveyController.getMySurveys);
router.get('/:id', protect, surveyController.getSurveyById);
router.put('/:id', protect, validateSurvey, surveyController.updateSurvey);
router.delete('/:id', protect, surveyController.deleteSurvey);
router.patch('/:id/status', protect, surveyController.updateSurveyStatus);
router.patch('/:id/settings', protect, surveyController.updateSurveySettings);
router.post('/:id/duplicate', protect, surveyController.duplicateSurvey);
router.get('/:id/export', protect, surveyController.exportSurveyData);

// ─── Public Route (no auth required) ─────────────────────────────────────
router.get('/public/:shareToken', optionalAuth, surveyController.getPublicSurvey);

module.exports = router;
```

### 8.2 Survey Controller — Full Implementation

**File**: `server/src/controllers/survey.controller.js`

#### `createSurvey(req, res, next)`
```
Input: { title, description, questions[], settings? }
- Validate using express-validator results
- Create Survey with creator = req.user._id
- Generate unique shareToken (auto-generated by schema default)
- Return 201 with full survey object including shareToken and shareable URL
- shareable URL = `${process.env.SURVEY_LINK_BASE_URL}/${shareToken}`
```

#### `getMySurveys(req, res, next)`
```
Input: Query params: page, limit, status, search, sortBy, sortOrder
- Find all surveys where creator = req.user._id
- Apply filters: status filter, text search on title/description
- Sort by: createdAt (default), totalResponses, title
- Paginate using mongoose-paginate-v2
- Include: totalResponses, status, shareToken, createdAt, questionCount
- Return paginated list with metadata
```

#### `getSurveyById(req, res, next)`
```
Input: req.params.id
- Find survey by _id
- Verify creator === req.user._id OR user.role === 'admin'
- Populate creator name and email
- Return full survey with all questions, settings, stats
```

#### `updateSurvey(req, res, next)`
```
Input: req.params.id, body with updated fields
- Verify ownership
- Allow updating: title, description, questions, settings
- If status === 'active' and already has responses, warn but allow question edits
  (questions CAN be edited, but note it may affect existing response display)
- Update and return new survey
```

#### `deleteSurvey(req, res, next)`
```
Input: req.params.id
- Verify ownership
- Delete survey document
- Delete all associated Response documents
- Return 200 with success message
```

#### `updateSurveyStatus(req, res, next)`
```
Input: req.params.id, body { status: 'draft'|'active'|'closed'|'archived' }
- Verify ownership
- Validate status transition logic:
  - draft → active (allowed)
  - active → closed (allowed)
  - closed → active (allowed)
  - any → archived (allowed)
  - archived → anything (NOT allowed without explicit override)
- If activating, validate survey has at least 1 question
- Update and emit socket event 'survey:status_changed' to room `survey:${surveyId}`
- Return updated survey
```

#### `duplicateSurvey(req, res, next)`
```
Input: req.params.id
- Find original survey
- Create copy with:
  - title = "Copy of [original title]"
  - status = 'draft'
  - New unique shareToken
  - stats reset to 0
  - Same questions and settings
- Return new survey
```

#### `getPublicSurvey(req, res, next)`
```
Input: req.params.shareToken
- Find survey by shareToken
- If not found → 404
- If status !== 'active' → return { success: false, message: 'Survey is not active', status: survey.status }
- If isExpired → return { success: false, message: 'Survey has closed', status: 'expired' }
- Check duplicate prevention if enabled (see Response Collection)
- Return survey: title, description, questions (without internal IDs like creator), settings.showProgressBar etc.
- IMPORTANT: Exclude creator info and internal stats from public response
```

---

## 9. BACKEND — RESPONSE COLLECTION API

### 9.1 Route Definitions

**File**: `server/src/routes/response.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const responseController = require('../controllers/response.controller');

// Public — submit a response
router.post('/survey/:shareToken', responseController.submitResponse);

// Protected — get responses for a survey
router.get('/survey/:surveyId', protect, responseController.getSurveyResponses);
router.get('/:responseId', protect, responseController.getResponseById);
router.delete('/:responseId', protect, responseController.deleteResponse);

module.exports = router;
```

### 9.2 Response Controller — Full Implementation

#### `submitResponse(req, res, next)`

This is the most critical endpoint. Implement with extreme care.

```
Input: req.params.shareToken, body { answers: [], startedAt?, sessionId? }

STEP 1 — Find and validate survey
- Find survey by shareToken, status: 'active'
- If not found or not active: return 404/403 with appropriate message
- Check isExpired virtual
- Check maxResponses limit

STEP 2 — Duplicate prevention (if enabled)
- If settings.preventDuplicates === true:
  - If method === 'ip':
    - Get IP from req.ip or x-forwarded-for header
    - Check if any Response exists with survey=this and metadata.ipAddress=clientIP
    - If exists: return 409 { success: false, message: 'You have already submitted a response.' }
  - If method === 'cookie':
    - Check sessionId in body against existing responses
    - If exists: return 409
  - If method === 'login':
    - Require req.user to be present
    - Check if user already responded

STEP 3 — Validate answers
- For each question in survey.questions:
  - If question.required === true, verify answer exists in submitted answers
  - For multiple_choice questions: verify selected optionId exists in question.options
  - For rating questions: verify value is a number between ratingScale.min and ratingScale.max
  - For short_text questions: verify value is a string, max 5000 chars
  - For checkbox questions: verify all selected optionIds exist
  - Build validation errors array, if non-empty return 422 with errors

STEP 4 — Build answer snapshot
- For each submitted answer, build answer document including:
  - questionId, questionText (snapshot from survey), questionType
  - value (for rating/text), selectedOptions with optionId + optionText snapshots
  - skipped: true if required===false and no answer provided

STEP 5 — Detect device type
- Parse req.headers['user-agent']
- Use simple regex: /mobile/i → 'mobile', /tablet/i → 'tablet', else 'desktop'

STEP 6 — Create Response document
- Save with metadata (ipAddress, userAgent, sessionId, completionTimeSeconds, deviceType)
- isComplete: true
- isAnonymous: !req.user

STEP 7 — Emit real-time event
- Emit to socket room `survey:${survey._id}`:
  event: 'response:new'
  data: { surveyId, totalResponses: survey.stats.totalResponses + 1, timestamp: new Date() }

STEP 8 — Return success
- Return 201 {
    success: true,
    message: survey.settings.thankYouMessage,
    data: { responseId: response._id }
  }
```

#### `getSurveyResponses(req, res, next)`
```
Input: req.params.surveyId, query { page, limit, startDate, endDate }
- Verify survey ownership
- Build filter: survey=surveyId, optionally filter by createdAt range
- Paginate responses
- Exclude metadata.ipAddress from returned data
- Return paginated responses with metadata
```

#### `deleteResponse(req, res, next)`
```
Input: req.params.responseId
- Find response and populate survey
- Verify survey.creator === req.user._id
- Delete response
- Decrement survey.stats.totalResponses by 1
- Return success
```

---

## 10. BACKEND — ANALYTICS API

### 10.1 Route Definitions

**File**: `server/src/routes/analytics.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

router.get('/survey/:surveyId/overview', protect, analyticsController.getSurveyOverview);
router.get('/survey/:surveyId/question/:questionId', protect, analyticsController.getQuestionAnalytics);
router.get('/survey/:surveyId/trends', protect, analyticsController.getResponseTrends);
router.get('/dashboard', protect, analyticsController.getDashboardStats);

module.exports = router;
```

### 10.2 Analytics Controller — Full Implementation

#### `getSurveyOverview(req, res, next)`

```
Input: req.params.surveyId

STEP 1 — Verify ownership

STEP 2 — Aggregate basic stats:
- Total responses
- Complete responses vs skipped
- Average completion time
- Device type breakdown (desktop/mobile/tablet)
- Response trend (last 7 days, grouped by day)

STEP 3 — Per-question breakdown:
For each question, compute:

  MULTIPLE CHOICE / YES_NO / CHECKBOX:
  - For each option: count of selections, percentage
  - totalAnswered, totalSkipped
  - Most popular option

  RATING:
  - Distribution: count per rating value
  - averageRating (rounded to 2 decimal places)
  - totalAnswered, totalSkipped
  - NPS-style: % excellent (4-5), % average (3), % poor (1-2)

  SHORT TEXT:
  - totalAnswered, totalSkipped
  - Sample of last 10 responses (text only)
  - Word count stats (avg words per response)

STEP 4 — Return full analytics object:
{
  surveyId,
  surveyTitle,
  overview: { totalResponses, completionRate, avgCompletionTimeSeconds, deviceBreakdown },
  questions: [{ questionId, questionText, type, analytics: {...} }],
  recentActivity: [ { date, count } ] // last 7 days
}
```

#### `getQuestionAnalytics(req, res, next)`
```
Detailed analytics for a single question.
Use MongoDB aggregation pipeline:
- Match responses for this survey
- Unwind answers array
- Match answers for this questionId
- Group and compute based on question type
- Return detailed breakdown
```

#### `getResponseTrends(req, res, next)`
```
Input: surveyId, query { period: '7d'|'30d'|'90d'|'all', groupBy: 'day'|'week'|'month' }
- Query responses within period
- Group by date bucket (day/week/month)
- Return array: [{ date, count, cumulative }]
```

#### `getDashboardStats(req, res, next)`
```
Aggregate stats across all surveys for logged-in user:
- totalSurveys (by status breakdown)
- totalResponses (all surveys combined)
- mostActiveSurvey (highest responses this week)
- recentActivity (responses per day, last 30 days, across all surveys)
- avgResponsesPerSurvey
- topPerformingSurveys (top 5 by response count)
```

---

## 11. BACKEND — EXPORT API

### 11.1 CSV Export

**File**: `server/src/utils/csvExport.utils.js`

```
Implement exportSurveyToCSV(survey, responses):
- Returns a CSV string
- Columns: ResponseID, SubmittedAt, DeviceType, CompletionTimeSeconds, then one column per question
- For multiple choice: column value = selected option text(s)
- For rating: column value = numeric rating
- For text: column value = response text
- Handle checkboxes as semicolon-separated values
- Use fast-csv library
```

### 11.2 PDF Export

**File**: `server/src/utils/pdfExport.utils.js`

```
Implement exportSurveyToPDF(survey, analyticsData):
- Returns a PDF buffer using pdfkit
- Include: Survey title, description, date generated
- Summary stats: total responses, avg completion time
- Per-question breakdown with visual bar representation (ASCII-style bars)
- Branded header with SurveyForge name
```

### 11.3 Export Controller

**File**: `server/src/controllers/export.controller.js`

#### `exportCSV(req, res, next)`
```
- Protected route
- Verify survey ownership
- Fetch all responses for survey
- Generate CSV
- Set headers: Content-Type: text/csv, Content-Disposition: attachment; filename="survey-{title}-{date}.csv"
- Stream CSV to response
```

#### `exportPDF(req, res, next)`
```
- Protected route
- Verify survey ownership
- Fetch analytics data
- Generate PDF
- Set headers: Content-Type: application/pdf, Content-Disposition: attachment; filename="survey-{title}-{date}.pdf"
- Pipe PDF stream to response
```

---

## 12. BACKEND — MIDDLEWARE STACK

### 12.1 Rate Limiting

**File**: `server/src/middleware/rateLimit.middleware.js`

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' },
  skipSuccessfulRequests: true,
});

// Survey submission (per IP)
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 survey submissions per IP per hour
  keyGenerator: (req) => req.ip,
  message: { success: false, message: 'Submission limit reached. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter, submissionLimiter };
```

Apply:
- `apiLimiter` on all `/api/v1` routes
- `authLimiter` on `/api/v1/auth/login` and `/api/v1/auth/register`
- `submissionLimiter` on `/api/v1/responses/survey/:shareToken`

### 12.2 Validation Middleware

**File**: `server/src/middleware/validate.middleware.js`

```javascript
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

module.exports = validate;
```

### 12.3 Error Handler

**File**: `server/src/middleware/errorHandler.middleware.js`

```javascript
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
```

### 12.4 Route Aggregator

**File**: `server/src/routes/index.js`

```javascript
const express = require('express');
const router = express.Router();
const { apiLimiter } = require('../middleware/rateLimit.middleware');

const authRoutes = require('./auth.routes');
const surveyRoutes = require('./survey.routes');
const responseRoutes = require('./response.routes');
const analyticsRoutes = require('./analytics.routes');
const exportRoutes = require('./export.routes');

// Apply general rate limit
router.use(apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/surveys', surveyRoutes);
router.use('/responses', responseRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/export', exportRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'SurveyForge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      surveys: '/api/v1/surveys',
      responses: '/api/v1/responses',
      analytics: '/api/v1/analytics',
      export: '/api/v1/export',
    },
  });
});

module.exports = router;
```

---

## 13. FRONTEND — REACT APP ARCHITECTURE

### 13.1 Vite Configuration

**File**: `client/vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
});
```

### 13.2 Axios Configuration

**File**: `client/src/api/axios.config.js`

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401, token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        // Refresh failed — logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 13.3 Auth Context

**File**: `client/src/context/AuthContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/api/axios.config';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const register = async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch { /* Silent */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 13.4 App Router

**File**: `client/src/router/AppRouter.jsx`

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import SurveyBuilder from '@/pages/SurveyBuilder';
import SurveyEdit from '@/pages/SurveyEdit';
import SurveyRespond from '@/pages/SurveyRespond';
import SurveyThankYou from '@/pages/SurveyThankYou';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';
import Spinner from '@/components/common/Spinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      
      {/* Survey respondent routes (public) */}
      <Route path="/s/:shareToken" element={<SurveyRespond />} />
      <Route path="/s/:shareToken/thank-you" element={<SurveyThankYou />} />

      {/* Protected creator routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/survey/new" element={<ProtectedRoute><SurveyBuilder /></ProtectedRoute>} />
      <Route path="/survey/:id/edit" element={<ProtectedRoute><SurveyEdit /></ProtectedRoute>} />
      <Route path="/survey/:id/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      
      {/* Error pages */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
```

---

## 14. FRONTEND — DESIGN SYSTEM & THEME

### 14.1 Tailwind Configuration

**File**: `client/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#baddff',
          300: '#7dc0fd',
          400: '#399ef8',
          500: '#0f80eb',
          600: '#0363c9',
          700: '#044fa3',
          800: '#084487',
          900: '#0d3970',
          950: '#09234a',
        },
        accent: {
          DEFAULT: '#6366f1',
          light: '#a5b4fc',
          dark: '#4338ca',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Geist', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(16px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideDown: { '0%': { transform: 'translateY(-8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        pulseDot: { '0%, 100%': { transform: 'scale(1)', opacity: 1 }, '50%': { transform: 'scale(1.4)', opacity: 0.7 } },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)',
        modal: '0 24px 64px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 14.2 Global Styles

**File**: `client/src/styles/globals.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 15 128 235;
    --color-accent: 99 102 241;
    --radius: 0.5rem;
  }

  * { box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-gray-50 text-gray-900 font-sans;
  }

  .dark body {
    @apply bg-gray-950 text-gray-100;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-gray-300 rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-gray-400; }
}

@layer components {
  .card {
    @apply bg-white rounded-xl border border-gray-100 shadow-card;
  }

  .dark .card {
    @apply bg-gray-900 border-gray-800;
  }

  .btn {
    @apply inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
           font-medium text-sm transition-all duration-150 
           focus:outline-none focus:ring-2 focus:ring-offset-2 
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700 
           focus:ring-primary-500 active:bg-primary-800;
  }

  .btn-secondary {
    @apply btn bg-white text-gray-700 border border-gray-200 
           hover:bg-gray-50 focus:ring-gray-300;
  }

  .btn-danger {
    @apply btn bg-red-50 text-red-600 border border-red-200 
           hover:bg-red-100 focus:ring-red-400;
  }

  .input {
    @apply w-full px-3 py-2 bg-white border border-gray-200 rounded-lg 
           text-sm placeholder-gray-400 
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
           transition-colors duration-150;
  }

  .label {
    @apply block text-sm font-medium text-gray-700 mb-1;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
}
```

---

## 15. FRONTEND — AUTHENTICATION PAGES

### 15.1 Login Page

**File**: `client/src/pages/Login.jsx`

Complete implementation requirements:
- Clean, centered card layout with the SurveyForge logo and tagline
- Email + password fields with proper labels and validation
- Show/hide password toggle button (eye icon)
- Form validation: show inline errors under each field
- Loading state: disable button and show spinner while submitting
- Error toast on failed login
- Success: navigate to `/dashboard`
- Link to register page
- Remember the user is already on a form — no redundant "Sign In" headers as first text

**State to manage:**
```javascript
const [formData, setFormData] = useState({ email: '', password: '' });
const [errors, setErrors] = useState({});
const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

**Validation:**
- email: required, valid email format
- password: required, min 1 char (login doesn't need strict validation, server handles it)

**Error handling:**
```javascript
try {
  setIsLoading(true);
  await login(formData.email, formData.password);
  navigate('/dashboard');
} catch (err) {
  const message = err.response?.data?.message || 'Login failed. Please try again.';
  toast.error(message);
} finally {
  setIsLoading(false);
}
```

### 15.2 Register Page

**File**: `client/src/pages/Register.jsx`

Same structure as Login. Additional fields:
- Name field (first field)
- Password strength indicator (implement as a colored bar: weak/medium/strong)
- Confirm password field

**Password strength logic:**
```javascript
const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-4 maps to: empty, weak, fair, good, strong
};
```

---

## 16. FRONTEND — SURVEY BUILDER

### 16.1 Survey Builder Page

**File**: `client/src/pages/SurveyBuilder.jsx`

This is the most complex page. It is a two-column layout:
- **Left column (60%)**: Question list with drag-and-drop reordering
- **Right column (40%)**: Active question editor panel

**State structure:**
```javascript
const [survey, setSurvey] = useState({
  title: '',
  description: '',
  questions: [],
  settings: {
    allowAnonymous: true,
    preventDuplicates: false,
    showProgressBar: true,
    showQuestionNumbers: true,
    thankYouMessage: 'Thank you for your response!',
    theme: 'default',
  },
});
const [activeQuestionId, setActiveQuestionId] = useState(null);
const [isSaving, setIsSaving] = useState(false);
const [isDirty, setIsDirty] = useState(false);
```

**Question types supported:**
1. `multiple_choice` — 2+ custom text options
2. `yes_no` — Auto-generates Yes/No options
3. `rating` — Configurable 1-5 or 1-10 scale with custom labels
4. `short_text` — Single text input with placeholder editor
5. `checkbox` — Multi-select version of multiple_choice

**Adding a question:**
```javascript
const addQuestion = (type) => {
  const newQuestion = {
    _id: generateTempId(), // uuid
    text: '',
    type,
    required: false,
    order: survey.questions.length,
    options: type === 'multiple_choice' || type === 'checkbox'
      ? [
          { _id: generateTempId(), text: 'Option 1', order: 0 },
          { _id: generateTempId(), text: 'Option 2', order: 1 },
        ]
      : type === 'yes_no'
      ? [
          { _id: generateTempId(), text: 'Yes', order: 0 },
          { _id: generateTempId(), text: 'No', order: 1 },
        ]
      : [],
    ratingScale: type === 'rating' ? { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' } : undefined,
  };
  setSurvey(prev => ({
    ...prev,
    questions: [...prev.questions, newQuestion],
  }));
  setActiveQuestionId(newQuestion._id);
  setIsDirty(true);
};
```

**Drag-and-drop reordering:**
Use `react-beautiful-dnd`:
```javascript
const onDragEnd = (result) => {
  if (!result.destination) return;
  const items = Array.from(survey.questions);
  const [reordered] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reordered);
  const reindexed = items.map((q, i) => ({ ...q, order: i }));
  setSurvey(prev => ({ ...prev, questions: reindexed }));
  setIsDirty(true);
};
```

**Auto-save:**
```javascript
useEffect(() => {
  if (!isDirty || !survey._id) return;
  const timer = setTimeout(async () => {
    await handleSave(true); // silent save
  }, 2000); // 2 second debounce
  return () => clearTimeout(timer);
}, [survey, isDirty]);
```

**Save logic:**
- If survey has no `_id` → POST to `/surveys`
- If survey has `_id` → PUT to `/surveys/:id`
- Show saving indicator in top bar
- On success, update URL to `/survey/:id/edit` if newly created

**Survey settings panel:**
Implement as a collapsible side panel or tab. Include all settings fields with toggle switches, date pickers for close date, etc.

**Publish flow:**
- "Publish Survey" button
- Validates: title not empty, at least 1 question, all questions have text
- Calls PATCH `/surveys/:id/status` with `{ status: 'active' }`
- Opens ShareModal with the shareable link

### 16.2 Question Editor Panel

**File**: `client/src/components/survey/QuestionEditor.jsx`

Renders based on active question type:

**For all types:**
- Question text textarea (auto-resizing)
- "Required" toggle
- Delete button (with confirmation)
- Duplicate question button

**For multiple_choice and checkbox:**
- List of options with text inputs
- "Add option" button
- Drag-to-reorder options
- Delete option button (min 2 options always required)

**For rating:**
- Scale selector: 5 stars or 10 stars (or custom range)
- Min/max label inputs

**For short_text:**
- Placeholder text input

### 16.3 Share Modal

**File**: `client/src/components/survey/ShareModal.jsx`

```
Display:
- Survey public URL: `${VITE_APP_DOMAIN}/s/${shareToken}`
- Copy to clipboard button (show "Copied!" feedback)
- QR code (optional, use a lightweight QR library)
- Social share buttons (just copy formatted text)
- Embed code: <iframe src="..."> snippet
- Link to analytics: "View Results →"
```

---

## 17. FRONTEND — SURVEY RESPONDENT VIEW

### 17.1 Survey Respond Page

**File**: `client/src/pages/SurveyRespond.jsx`

This is the **public-facing** page. It must be beautiful, mobile-first, and work without authentication.

**Flow:**
1. Page loads → fetch survey by shareToken (`/surveys/public/:shareToken`)
2. Handle error states:
   - 404: "Survey not found"
   - Survey not active: Show status-specific message
   - Expired: "This survey has closed"
3. Show survey title + description
4. Render questions one-by-one (or all at once based on settings)
5. Show progress bar if `settings.showProgressBar === true`
6. Collect answers in local state
7. Validate required questions before submit
8. Submit to `/responses/survey/:shareToken`
9. On success → navigate to `/s/:shareToken/thank-you`

**Answer state:**
```javascript
const [answers, setAnswers] = useState({});
// Key: questionId, Value: response value

const updateAnswer = (questionId, value) => {
  setAnswers(prev => ({ ...prev, [questionId]: value }));
};
```

**Submit logic:**
```javascript
const handleSubmit = async () => {
  // Validate required questions
  const missingRequired = survey.questions
    .filter(q => q.required && !answers[q._id])
    .map(q => q._id);
  
  if (missingRequired.length > 0) {
    setMissingFields(missingRequired);
    toast.error('Please answer all required questions');
    return;
  }

  // Build answers array
  const answersArray = survey.questions.map(q => {
    const answer = answers[q._id];
    return {
      questionId: q._id,
      value: ['short_text', 'rating'].includes(q.type) ? answer : undefined,
      selectedOptions: ['multiple_choice', 'yes_no', 'checkbox'].includes(q.type)
        ? (Array.isArray(answer) ? answer : [answer]).filter(Boolean).map(optId => ({
            optionId: optId,
            optionText: q.options.find(o => o._id === optId)?.text || '',
          }))
        : undefined,
      skipped: !answer,
    };
  });

  try {
    setIsSubmitting(true);
    const startedAt = sessionStartTime;
    await submitResponse(shareToken, { answers: answersArray, startedAt });
    navigate(`/s/${shareToken}/thank-you`, {
      state: { message: survey.settings.thankYouMessage }
    });
  } catch (err) {
    const message = err.response?.data?.message || 'Submission failed. Please try again.';
    toast.error(message);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 17.2 Question Field Components

#### MultipleChoiceField
```javascript
// Single select — radio button style (but custom designed)
// Show: circle radio indicators, option text
// On select: highlight entire option row with primary color
// Keyboard accessible
```

#### RatingField
```javascript
// Render as star icons (for 1-5) or numbered buttons (for 1-10)
// Hover effect: highlight up to hovered star
// Selected state: fill in stars up to selected rating
// Show min/max labels below
```

#### ShortTextField
```javascript
// Standard textarea
// Character counter (if maxlength set)
// Auto-resize as user types
```

#### CheckboxField
```javascript
// Multi-select version of MultipleChoiceField
// Checkbox style indicators
// Multiple selections allowed
```

---

## 18. FRONTEND — MY SURVEYS DASHBOARD

### 18.1 Dashboard Page

**File**: `client/src/pages/Dashboard.jsx`

Layout: Main content area with sidebar navigation.

**Stats row at top:**
- Total Surveys created
- Total Responses collected (all surveys combined)
- Active Surveys count
- Response rate (avg across active surveys)

**Surveys grid:**
- 3-column grid on desktop, 2 on tablet, 1 on mobile
- Each survey card shows:
  - Survey title (truncated)
  - Status badge (draft/active/closed/archived) with color coding
  - Response count with icon
  - Created date (relative: "3 days ago")
  - Action buttons: Edit, View Analytics, Share, Delete
- Empty state: Illustration + "Create your first survey" CTA

**Filtering and search:**
- Search bar (debounced, 300ms)
- Status filter tabs: All / Active / Draft / Closed / Archived
- Sort: Newest / Most Responses / Alphabetical

**SurveyCard component:**
```javascript
const SurveyCard = ({ survey, onDelete, onShare, onStatusChange }) => {
  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-600', label: 'Draft' },
    active: { color: 'bg-green-100 text-green-700', label: 'Active' },
    closed: { color: 'bg-red-100 text-red-600', label: 'Closed' },
    archived: { color: 'bg-yellow-100 text-yellow-700', label: 'Archived' },
  };
  // ... render
};
```

---

## 19. FRONTEND — ANALYTICS DASHBOARD

### 19.1 Analytics Page

**File**: `client/src/pages/Analytics.jsx`

This is the data visualization hub. Implement with full Recharts integration.

**Page structure:**
```
┌─────────────────────────────────────────────────┐
│  ← Back  |  Survey Title                [Export ▼] │
├───────────┬─────────────────────────────────────┤
│  Overview │  Responses  │  Individual  │  Raw  │
│  Cards    │   Trend     │  Questions   │ Data  │
├───────────┴─────────────────────────────────────┤
│  Live indicator: 🟢 Live · 47 total responses   │
├─────────────────────────────────────────────────┤
│  [Total Responses] [Avg Time] [Completion Rate] │
│  [Device Breakdown]                             │
├─────────────────────────────────────────────────┤
│  Response Trend (LineChart)                     │
├─────────────────────────────────────────────────┤
│  Question-by-Question breakdown                 │
│  ┌─────────────────┐ ┌─────────────────┐       │
│  │ Q1 PieChart     │ │ Q2 BarChart     │       │
│  └─────────────────┘ └─────────────────┘       │
└─────────────────────────────────────────────────┘
```

**Data loading:**
```javascript
const { data: analytics, isLoading, refetch } = useAnalytics(surveyId);

// Poll every 30 seconds as fallback
useEffect(() => {
  const interval = setInterval(refetch, 30000);
  return () => clearInterval(interval);
}, [refetch]);
```

**Live indicator with socket:**
```javascript
useEffect(() => {
  socket.emit('join:survey', surveyId);
  socket.on('response:new', (data) => {
    refetch(); // Refresh analytics data
    setLiveCount(data.totalResponses);
    toast.success(`New response received!`, { icon: '📊', duration: 2000 });
  });
  return () => {
    socket.emit('leave:survey', surveyId);
    socket.off('response:new');
  };
}, [surveyId]);
```

### 19.2 Chart Components

#### PieChartWidget
```javascript
// Used for: multiple_choice, yes_no questions
// Show:
//   - Recharts PieChart with custom colors
//   - Legend with option text + count + percentage
//   - Center label: total responses for this question
// 
// Color palette: Use consistent brand colors
// ['#0f80eb', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
```

#### BarChartWidget
```javascript
// Used for: multiple_choice (alternative view), rating distribution
// Show:
//   - Recharts BarChart
//   - X-axis: option labels / rating values
//   - Y-axis: count
//   - Tooltip with count + percentage
//   - Color: gradient from primary-400 to primary-600
```

#### TrendLineChart
```javascript
// Used for: response trend over time
// Show:
//   - Recharts LineChart with smooth curve
//   - Area fill below the line
//   - X-axis: dates
//   - Y-axis: response count
//   - Tooltip: "N responses on [date]"
//   - Period selector: 7d / 30d / 90d / All
```

#### RatingWidget (star display)
```javascript
// Used for: rating questions
// Show:
//   - Large average rating number
//   - Star display (filled/half/empty based on average)
//   - Distribution bar chart (1★ to 5★ counts)
//   - Satisfaction percentage (% of 4-5 ratings)
```

#### StatCard
```javascript
// Props: { title, value, subtitle, icon, trend, trendValue }
// Show trend arrow: up (green) or down (red)
```

### 19.3 Export Dropdown

```javascript
const ExportDropdown = ({ surveyId }) => {
  const exportCSV = async () => {
    const response = await axiosInstance.get(`/export/${surveyId}/csv`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-${surveyId}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportPDF = async () => {
    // Same pattern with responseType: 'blob'
  };
  
  // Render dropdown menu with CSV and PDF options
};
```

---

## 20. FRONTEND — SHARED COMPONENTS LIBRARY

### 20.1 Button Component

**File**: `client/src/components/common/Button.jsx`

```javascript
// Props: variant ('primary'|'secondary'|'danger'|'ghost'), size ('sm'|'md'|'lg'),
//        loading (bool), icon, iconPosition ('left'|'right'), fullWidth, disabled, onClick, children
// Loading state: replace icon with spinner, disable pointer events
// All styling via tailwind, use class-variance-authority or manual variant map
```

### 20.2 Input Component

**File**: `client/src/components/common/Input.jsx`

```javascript
// Props: label, error, helper, leftIcon, rightIcon, ...rest (standard input props)
// Show error: red border + red error text below
// Focus state: ring animation
// Forward ref for form libraries
```

### 20.3 Modal Component

**File**: `client/src/components/common/Modal.jsx`

```javascript
// Props: isOpen, onClose, title, children, footer, size ('sm'|'md'|'lg'|'xl')
// Backdrop: semi-transparent overlay, click to close
// Animation: fade in + scale from 95% to 100%
// Trap focus inside modal when open
// Close on Escape key
// Portal: render outside component tree using createPortal
```

### 20.4 Spinner Component

**File**: `client/src/components/common/Spinner.jsx`

```javascript
// Props: size ('sm'|'md'|'lg'), color, fullPage (bool)
// fullPage: centered in viewport with backdrop
// Sizes: sm=16px, md=24px, lg=40px
// CSS animation: spin 0.8s linear infinite
```

### 20.5 EmptyState Component

```javascript
// Props: icon, title, description, action (button config)
// Used for: empty survey list, no responses, etc.
// Include a relevant illustration (SVG inline)
```

### 20.6 Navbar Component

```javascript
// Show: Logo, Nav links (Dashboard, Create Survey), User menu
// User menu: avatar/initials, name, Profile link, Sign out
// Mobile: hamburger menu → slide-in drawer
// Sticky top with backdrop blur
```

---

## 21. REAL-TIME FEATURES — WEBSOCKETS

### 21.1 Socket.io Server Setup

**File**: `server/src/config/socket.js`

```javascript
const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join survey room (for analytics real-time updates)
    socket.on('join:survey', (surveyId) => {
      socket.join(`survey:${surveyId}`);
      console.log(`Socket ${socket.id} joined room survey:${surveyId}`);
    });

    // Leave survey room
    socket.on('leave:survey', (surveyId) => {
      socket.leave(`survey:${surveyId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

// Export getter for use in controllers
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initializeSocket, getIO };
```

### 21.2 Emitting Events from Controllers

In `response.controller.js`, after saving a response:

```javascript
const { getIO } = require('../config/socket');

// After successful response save:
try {
  const io = getIO();
  io.to(`survey:${survey._id}`).emit('response:new', {
    surveyId: survey._id.toString(),
    totalResponses: survey.stats.totalResponses + 1, // +1 because post-save hook runs async
    timestamp: new Date().toISOString(),
    questionBreakdown: null, // Don't send full analytics on every response for performance
  });
} catch (socketErr) {
  // Non-critical — don't fail the response if socket emit fails
  console.warn('Socket emit failed:', socketErr.message);
}
```

### 21.3 Socket Context (Frontend)

**File**: `client/src/context/SocketContext.jsx`

```javascript
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

---

## 22. EXPORT FEATURES — CSV & PDF

### 22.1 CSV Export Format

Column layout:
```
ResponseID | SubmittedAt | DeviceType | CompletionTime(s) | Q1: [title] | Q2: [title] | ...
```

Rules:
- Escape commas and quotes in text responses
- Rating answers: numeric value only
- Multiple choice: selected option text
- Checkbox: semicolon-separated selected options
- Skipped questions: empty cell (not "N/A")
- First row: column headers
- Date format: ISO 8601 (2024-01-15T10:30:00Z)

### 22.2 PDF Export Format

Page structure:
```
Page 1: Cover
  - SurveyForge logo
  - Survey title (large)
  - Description
  - Generated date
  - Creator name

Page 2+: Analytics Summary
  - Total responses
  - Date range of responses
  - Completion rate
  - Device breakdown

Per-question pages:
  - Question number + text
  - Question type badge
  - For choice questions: option | count | percentage | bar visualization
  - For rating: average, distribution table
  - For text: "X responses collected" + sample answers (last 5)
```

---

## 23. SECURITY IMPLEMENTATION

### 23.1 Input Sanitization

Install `express-mongo-sanitize` and `xss-clean`:

```javascript
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// In app.js, BEFORE routes:
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss());           // Prevent XSS attacks
```

### 23.2 Validators

**File**: `server/src/validators/survey.validator.js`

```javascript
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const validateSurvey = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('questions')
    .isArray({ min: 1, max: 50 }).withMessage('Survey must have 1 to 50 questions'),

  body('questions.*.text')
    .trim()
    .notEmpty().withMessage('Question text cannot be empty')
    .isLength({ max: 1000 }),

  body('questions.*.type')
    .isIn(['multiple_choice', 'rating', 'short_text', 'yes_no', 'checkbox'])
    .withMessage('Invalid question type'),

  body('questions.*.options')
    .if(body('questions.*.type').isIn(['multiple_choice', 'yes_no', 'checkbox']))
    .isArray({ min: 2, max: 20 })
    .withMessage('Choice questions must have 2 to 20 options'),

  validate,
];

module.exports = { validateSurvey };
```

### 23.3 Security Headers Checklist

Ensure the following headers are set (via Helmet):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Remove `X-Powered-By` header

### 23.4 Frontend Security

- All user-generated content rendered as text (not dangerouslySetInnerHTML)
- Tokens stored in localStorage (acceptable for this app tier; use httpOnly cookies in high-security contexts)
- All API errors handled gracefully — no stack traces in production UI
- Input length limits mirrored on frontend

---

## 24. ERROR HANDLING STRATEGY

### 24.1 API Error Response Format

All error responses must follow this exact shape:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "not-an-email"
    }
  ],
  "code": "OPTIONAL_ERROR_CODE"
}
```

### 24.2 Frontend Error Handling

```javascript
// api/error.handler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400: return data.message || 'Invalid request';
      case 401: return 'Authentication required';
      case 403: return 'You do not have permission';
      case 404: return 'Resource not found';
      case 409: return data.message || 'Conflict with existing data';
      case 422: return data.errors?.[0]?.message || 'Validation failed';
      case 429: return 'Too many requests. Please slow down.';
      case 500: return 'Server error. Please try again later.';
      default: return data.message || 'Something went wrong';
    }
  }
  
  if (error.request) {
    return 'Network error. Check your internet connection.';
  }
  
  return 'Unexpected error occurred';
};
```

### 24.3 React Error Boundary

**File**: `client/src/components/common/ErrorBoundary.jsx`

```javascript
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">An unexpected error occurred.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
```

Wrap app in `<ErrorBoundary>` in `App.jsx`.

---

## 25. TESTING REQUIREMENTS

### 25.1 Backend Tests

**File**: `server/src/tests/auth.test.js`

Implement tests for:
- `POST /api/v1/auth/register` — success, duplicate email, weak password
- `POST /api/v1/auth/login` — success, wrong password, nonexistent email
- `GET /api/v1/auth/me` — with valid token, with expired token, without token

**File**: `server/src/tests/survey.test.js`

Implement tests for:
- Create survey — success, missing title, too many questions
- Get my surveys — returns only creator's surveys
- Get public survey — active survey, inactive survey, nonexistent token
- Update survey — as owner, as non-owner (403 expected)
- Delete survey — also deletes associated responses

**File**: `server/src/tests/response.test.js`

Implement tests for:
- Submit response — success, missing required question, invalid rating value
- Duplicate prevention — second submission from same IP should fail
- Get responses — as owner, as non-owner

**Test setup:**
```javascript
// Use mongodb-memory-server for tests
// Run: npm install --save-dev jest supertest mongodb-memory-server @jest/globals
```

---

## 26. PERFORMANCE OPTIMIZATION

### 26.1 Backend

1. **Indexing**: All critical indexes defined in schemas (see Section 5).
2. **Projection**: Never return all document fields. Use `.select()` to return only needed fields.
3. **Pagination**: All list endpoints paginated (default: 10 per page, max: 100).
4. **Aggregation**: Use MongoDB aggregation pipeline for analytics — never fetch all documents and compute in JavaScript.
5. **Compression**: Gzip all responses via `compression` middleware.
6. **Connection pooling**: Mongoose handles this automatically; default pool size = 5.

### 26.2 Frontend

1. **Code splitting**: Use `React.lazy` + `Suspense` for all page-level components.
2. **Memoization**: Wrap expensive calculations in `useMemo`, stable callbacks in `useCallback`.
3. **Debounce**: Search inputs debounced at 300ms. Auto-save debounced at 2000ms.
4. **Image optimization**: No heavy images. Use SVG icons via Lucide React.
5. **Bundle analysis**: Run `npx vite-bundle-visualizer` and ensure no single chunk > 500KB.
6. **React Query / SWR** [OPTIONAL]: Consider wrapping API calls with React Query for caching and background refetch.

---

## 27. DEPLOYMENT CONFIGURATION

### 27.1 Docker Compose (Optional but Recommended)

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:7
    container_name: surveyforge-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: surveyforge

  server:
    build: ./server
    container_name: surveyforge-server
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/surveyforge
    depends_on:
      - mongo
    volumes:
      - ./server:/app
      - /app/node_modules

  client:
    build: ./client
    container_name: surveyforge-client
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - server

volumes:
  mongo_data:
```

### 27.2 Production Build

**Client Dockerfile:**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://server:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /socket.io {
        proxy_pass http://server:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 28. FINAL INTEGRATION CHECKLIST

Before declaring the project complete, verify each item below:

### Backend Verification
- [ ] MongoDB connection is stable and reconnects on drop
- [ ] All 5 route files are mounted in `routes/index.js`
- [ ] JWT tokens are generated with correct expiry
- [ ] Refresh token rotation works correctly
- [ ] Survey shareToken is unique across all documents
- [ ] Response submission correctly validates all question types
- [ ] Duplicate prevention (IP-based) works correctly
- [ ] Analytics aggregation returns correct percentages
- [ ] CSV export downloads correctly with proper headers
- [ ] PDF export downloads correctly
- [ ] Rate limiting is active on auth and submission routes
- [ ] All sensitive fields excluded from API responses (passwords, IPs, refresh tokens)
- [ ] CORS allows only configured origins
- [ ] Helmet security headers applied

### Frontend Verification
- [ ] Login and register work end-to-end
- [ ] JWT token persists on page refresh
- [ ] Axios interceptor refreshes expired tokens automatically
- [ ] Survey builder can create all 5 question types
- [ ] Drag-and-drop question reordering works
- [ ] Survey can be published (status → active)
- [ ] Share modal shows correct public URL
- [ ] Public survey link loads survey for unauthenticated users
- [ ] All question types render correctly on respond page
- [ ] Required question validation fires before submit
- [ ] Thank-you page shown after successful submission
- [ ] Analytics dashboard loads for survey with responses
- [ ] PieChart, BarChart, and LineChart all render with real data
- [ ] Socket.io live indicator shows connected state
- [ ] New response received → analytics refreshes
- [ ] CSV export triggers file download
- [ ] Dark mode toggle works if implemented
- [ ] All pages are responsive at 375px width
- [ ] Error states handled on all data-fetching pages
- [ ] Loading spinners shown while fetching

### Integration Tests
- [ ] Create survey → publish → submit response → view in analytics
- [ ] Duplicate prevention blocks second submission from same IP
- [ ] Closing a survey prevents new submissions
- [ ] Deleting a survey also removes all responses
- [ ] Export CSV contains accurate response data

---

## APPENDIX A — API QUICK REFERENCE

```
Authentication
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/logout
  POST   /api/v1/auth/refresh-token
  GET    /api/v1/auth/me
  PATCH  /api/v1/auth/profile
  PATCH  /api/v1/auth/change-password

Surveys (protected)
  POST   /api/v1/surveys
  GET    /api/v1/surveys/my
  GET    /api/v1/surveys/:id
  PUT    /api/v1/surveys/:id
  DELETE /api/v1/surveys/:id
  PATCH  /api/v1/surveys/:id/status
  PATCH  /api/v1/surveys/:id/settings
  POST   /api/v1/surveys/:id/duplicate

Surveys (public)
  GET    /api/v1/surveys/public/:shareToken

Responses
  POST   /api/v1/responses/survey/:shareToken    (public)
  GET    /api/v1/responses/survey/:surveyId      (protected)
  GET    /api/v1/responses/:responseId           (protected)
  DELETE /api/v1/responses/:responseId           (protected)

Analytics (protected)
  GET    /api/v1/analytics/survey/:surveyId/overview
  GET    /api/v1/analytics/survey/:surveyId/question/:questionId
  GET    /api/v1/analytics/survey/:surveyId/trends
  GET    /api/v1/analytics/dashboard

Export (protected)
  GET    /api/v1/export/:surveyId/csv
  GET    /api/v1/export/:surveyId/pdf
```

---

## APPENDIX B — SOCKET.IO EVENT REFERENCE

```
Client → Server Events:
  join:survey     (surveyId: string)
  leave:survey    (surveyId: string)

Server → Client Events:
  response:new    ({ surveyId, totalResponses, timestamp })
  survey:status_changed  ({ surveyId, status })
```

---

## APPENDIX C — COMMON PITFALLS TO AVOID

1. **Never use `req.body.ipAddress`** for IP-based dedup. Always use `req.ip` or `req.headers['x-forwarded-for']`.
2. **Never return `password` or `refreshToken`** in any user response without explicit `.select('+password')`.
3. **Always use `uuidv4()` for `shareToken`**, not MongoDB ObjectId — ObjectIds are guessable.
4. **Mongoose virtuals won't serialize** unless you set `{ toJSON: { virtuals: true } }` on the schema.
5. **Socket.io rooms are in-memory** — they reset on server restart. Don't rely on them for persistent state.
6. **Axios `responseType: 'blob'`** is required for file downloads. Forgetting this will corrupt the file.
7. **React Beautiful DnD requires `<DragDropContext>` to wrap the entire droppable area** — not just the list.
8. **Recharts requires a fixed height** on the container div (e.g., `height: 300`) — it won't auto-size from 0.
9. **MongoDB aggregation `$match` must come first** in pipeline for index usage.
10. **Never call `next(err)` AND `res.json()`** in the same route handler — it causes "headers already sent" errors.

---

## APPENDIX D — RECOMMENDED DEVELOPMENT ORDER

Follow this order to minimize integration headaches:

```
Phase 1 — Foundation (Day 1)
  1. Initialize repo structure
  2. Set up server with Express + MongoDB
  3. Implement User model + auth system
  4. Test auth with Postman/Insomnia

Phase 2 — Core Backend (Day 2)
  5. Survey model + CRUD routes
  6. Response collection + validation
  7. Basic analytics aggregation
  8. Test all endpoints

Phase 3 — Frontend Foundation (Day 3)
  9. Set up React + Tailwind + routing
  10. Auth pages (Login, Register)
  11. AuthContext + Axios interceptors
  12. Navbar + Protected routes

Phase 4 — Core Frontend (Day 4–5)
  13. Survey Builder page
  14. Survey Respond page (public)
  15. Thank You page
  16. Dashboard (My Surveys)

Phase 5 — Analytics (Day 6)
  17. Analytics page with charts
  18. Socket.io live updates
  19. Export functionality

Phase 6 — Polish (Day 7)
  20. Error states + loading states
  21. Mobile responsiveness
  22. Performance optimization
  23. Final integration testing
```

---

*End of SURVEYFORGE_AGENT_BUILD.md — Version 1.0.0*
*Total specification: ~4,200 lines | Estimated implementation: 8,000–12,000 lines of code*
