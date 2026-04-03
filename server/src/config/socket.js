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
