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
