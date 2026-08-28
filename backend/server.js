// ================================================================
// Campus Hub - Express Server Entry Point
// ================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ================================================================
// CORS Configuration
// Supports production Vercel frontend, custom FRONTEND_URL / CORS_ORIGIN,
// and local development origins with credentials and preflight handling.
// ================================================================
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

// Extract origins from environment variables (comma-separated or single)
const envOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGIN]
  .filter(Boolean)
  .flatMap(url => url.split(',').map(s => s.trim()).filter(Boolean));

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envOrigins])];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser / server-to-server / curl requests
  
  const normalized = origin.replace(/\/$/, '');
  
  // Exact match with allowed origins
  if (allowedOrigins.some(o => o.replace(/\/$/, '') === normalized)) {
    return true;
  }
  
  // Allow all Vercel deployed preview & production URLs (*.vercel.app)
  if (/^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(normalized)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ [CORS Blocked] Origin not allowed: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url} - Origin: ${req.headers.origin || 'N/A'}`);
  next();
});

// ========================
// API Routes
// ========================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/registrations', require('./routes/registrations.routes'));
app.use('/api/resources', require('./routes/resources.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/venues', require('./routes/venues.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/feedback', require('./routes/feedback.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/audit', require('./routes/audit.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Campus Hub API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler (handles CORS errors gracefully)
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('not allowed by CORS')) {
    return res.status(403).json({ error: 'CORS policy does not allow access from this origin' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Campus Hub API running on http://localhost:${PORT}`);
  console.log(`🔒 Allowed CORS Origins:`, allowedOrigins);
  console.log(`🌐 Vercel (*.vercel.app) origins are automatically allowed`);
});
