/**
 * DevOps Dashboard - Express Server
 * Main application entry point
 */

const express = require('express');
const path = require('path');
const incidentsRouter = require('./routes/incidents');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/incidents', incidentsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'DevOps Dashboard API',
    version: '0.1.0',
    endpoints: {
      incidents: 'GET/POST /api/incidents',
      health: 'GET /health'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Server Error',
    message: err.message
  });
});

// Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ DevOps Dashboard running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
