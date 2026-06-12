import { io } from 'socket.io-client';

// Server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create socket instance (not connected yet)
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: {
    token: localStorage.getItem('token')
  }
});

export default socket;
