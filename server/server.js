import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import AppError from './utils/AppError.js';
import errorHandler from './middleware/errorHandler.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import uploadRoutes from "./routes/upload.js";


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (origin === process.env.CLIENT_URL) {
    return true;
  }

  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
};

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Not allowed by Socket.io CORS: ${origin}`), false);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Expose io via express app for controllers/middleware
app.set('io', io);

// Socket.io middleware to verify JWT from client
io.use((socket, next) => {
  const token = socket.handshake?.auth?.token;
  if (!token) return next(new Error('No token'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.data.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  const userEmail = socket.data?.user?.email || 'unknown';
  console.log(`✅ User connected: ${socket.id} | User: ${userEmail}`);

  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});
// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes(io));
app.use("/api/upload", uploadRoutes);


// Health check endpoint (keep this for testing)
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date(),
    database: 'Connected'
  });
});

// Intentional error route for testing error flow
app.get('/api/error-test', (req, res, next) => {
  next(new AppError('Intentional test error', 500));
});

// Handle unmatched routes
app.use((req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
});

// Global error handler
app.use(errorHandler);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});