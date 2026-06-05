import { Server } from 'socket.io';
import { config } from '../config.js';
import { verifyToken } from '../auth.js';
import { logger } from '../utils/logger.js';

let io = null;

export function attachSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.clientUrl, credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('UNAUTHENTICATED'));
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      socket.data.username = payload.username;
      next();
    } catch (err) {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const room = `user:${socket.data.userId}`;
    socket.join(room);
    logger.info('socket connected', { user: socket.data.username });
    socket.on('disconnect', () => {
      logger.debug('socket disconnected', { user: socket.data.username });
    });
  });

  return io;
}

export function emitTo(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function broadcast(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

export function getIo() { return io; }
