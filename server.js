require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');

const db = require('./config/database');
const WebSocketService = require('./services/websocket');

const authRoutes = require('./routes/auth');
const txRoutes = require('./routes/transactions');
const walletRoutes = require('./routes/wallets');
const alertRoutes = require('./routes/alerts');
const caseRoutes = require('./routes/cases');
const analyticsRoutes = require('./routes/analytics');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const searchRoutes = require('./routes/search');

const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    network: process.env.ALCHEMY_NETWORK || 'eth-mainnet'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize WebSocket service
const wsService = new WebSocketService(server);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    BLOCKSENTINEL API v1.0                    ║
║                                                              ║
║  Server running on port ${PORT.toString().padEnd(41)}║
║  Network: ${(process.env.ALCHEMY_NETWORK || 'eth-mainnet').padEnd(47)}║
║  WebSocket: Active                                           ║
║  Database: SQLite (blocksentinel.db)                         ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Start Alchemy WebSocket connection
  setTimeout(() => {
    wsService.connectAlchemy();
  }, 2000);
});

module.exports = { app, wsService };
