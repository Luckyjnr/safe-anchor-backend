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
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Swagger docs
setupSwagger(app);

// Routes
app.get('/', (req, res) => res.send('Safe Anchor API Running'));
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