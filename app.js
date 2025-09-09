require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const setupSwagger = require('./swagger'); // Only once!

const authRoutes = require('./routes/api/auth');
const expertRoutes = require('./routes/api/experts');
const victimRoutes = require('./routes/api/victims');
const sessionRoutes = require('./routes/api/sessions');
const resourceRoutes = require('./routes/api/resources');
const victimDashboardRoutes = require('./routes/api/victimDashboard');
const expertDashboardRoutes = require('./routes/api/expertDashboard');
const crisisHotlineRoutes = require('./routes/api/crisisHotlines');
const supportGroupRoutes = require('./routes/api/supportGroup');


const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000', // Local development
      'http://localhost:3001',
      'https://your-frontend-domain.com', // Replace with your actual frontend domain
      process.env.FRONTEND_URL
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
app.use(helmet());
app.use(morgan('dev'));

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

app.use('/api/auth', authRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/victim-dashboard', victimDashboardRoutes);
app.use('/api/expert-dashboard', expertDashboardRoutes);
app.use('/api/crisis-hotlines', crisisHotlineRoutes);
app.use('/api/support-groups', supportGroupRoutes);


module.exports = app;