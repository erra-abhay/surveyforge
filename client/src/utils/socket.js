import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join_survey_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave_survey_room', roomId);
    }
  }

  subscribe(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  unsubscribe(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
