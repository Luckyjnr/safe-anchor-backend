require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const setupSwagger = require('./swagger'); // Only once!

// Security middleware
const { generalLimiter, authLimiter, helmetConfig } = require('./middleware/security');

const authRoutes = require('./routes/api/auth');
const expertRoutes = require('./routes/api/experts');
const victimRoutes = require('./routes/api/victims');
const sessionRoutes = require('./routes/api/sessions');
const resourceRoutes = require('./routes/api/resources');
const victimDashboardRoutes = require('./routes/api/victimDashboard');
const expertDashboardRoutes = require('./routes/api/expertDashboard');
const crisisHotlineRoutes = require('./routes/api/crisisHotlines');
const supportGroupRoutes = require('./routes/api/supportGroup');
const testRoutes = require('./routes/api/test');
const debugRoutes = require('./routes/api/debugRoutes');


const app = express();

// Basic security middleware
app.use(helmetConfig);
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - TEMPORARY for frontend team testing
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Your production frontend
      'http://localhost:3001', // Alternative local port
      'https://safe-anchor-web-page.vercel.app', // Production Vercel frontend
      process.env.FRONTEND_URL,
      // TEMPORARY: Frontend team development URLs
      'http://127.0.0.1:5502', // Frontend team's local server
      'http://localhost:5502', // Alternative localhost format
      'http://127.0.0.1:3000', // Common local development
      'http://127.0.0.1:5500', // Another common local port
      'http://localhost:5500', // Alternative localhost format
      'http://127.0.0.1:8080', // Another common local port
      'http://localhost:8080'  // Alternative localhost format
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(generalLimiter); // Basic rate limiting

// Swagger docs
setupSwagger(app);

// Routes
app.get('/', (req, res) => res.send('Safe Anchor API Running'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Apply specific rate limiting to sensitive routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/victim-dashboard', victimDashboardRoutes);
app.use('/api/expert-dashboard', expertDashboardRoutes);
app.use('/api/crisis-hotlines', crisisHotlineRoutes);
app.use('/api/support-groups', supportGroupRoutes);
app.use('/api/test', testRoutes);
app.use('/api', debugRoutes); // Debug routes


module.exports = app;