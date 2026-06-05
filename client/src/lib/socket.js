import { io } from 'socket.io-client';

let socket = null;
let tokenRef = null;

export function getSocket(token) {
  if (token) tokenRef = token;
  if (socket) return socket;
  const url = import.meta.env.DEV ? 'http://localhost:4000' : '/';
  socket = io(url, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    auth: { token: tokenRef },
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    tokenRef = null;
  }
}
