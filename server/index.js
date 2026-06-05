import express from 'express';
import http from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { attachUser, requireAuth, requireTotp } from './middleware/authMiddleware.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import { attachSockets } from './sockets/index.js';
import { startCapture, getCaptureStatus } from './services/capture.js';
import { listIntel } from './services/threatIntel.js';

import authRoutes from './routes/auth.js';
import alertRoutes from './routes/alerts.js';
import networkRoutes from './routes/network.js';
import osintRoutes from './routes/osint.js';
import scannerRoutes from './routes/scanner.js';
import settingsRoutes from './routes/settings.js';
import systemRoutes from './routes/system.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src':  ["'self'", 'https://fonts.googleapis.com'],
      'style-src':   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src':    ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src':     ["'self'", 'data:', 'https://*.basemaps.cartocdn.com'],
      'connect-src': ["'self'", 'ws:', 'wss:', 'https://*.basemaps.cartocdn.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(attachUser);

// Public routes
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/api/auth', authRoutes);

// Protected routes — require JWT
app.use('/api', requireAuth);
app.use('/api/alerts',   requireTotp, alertRoutes);
app.use('/api/network',  requireTotp, networkRoutes);
app.use('/api/osint',    requireTotp, osintRoutes);
app.use('/api/scanner',  requireTotp, scannerRoutes);
app.use('/api/settings', requireTotp, settingsRoutes);
app.use('/api/system',   requireTotp, systemRoutes);

app.get('/api/threat/feed', requireTotp, (_req, res) => {
  res.json({ items: listIntel(20) });
});

app.get('/api/network/capture-status', requireTotp, (_req, res) => {
  res.json(getCaptureStatus());
});

app.use(apiLimiter);

// Serve client build in production
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
import('node:fs').then(({ existsSync }) => {
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }
});

app.use(errorHandler);

const server = http.createServer(app);
attachSockets(server);

server.listen(config.port, () => {
  logger.info(`SOC server listening on :${config.port}  (client ${config.clientUrl})`);
  startCapture();
});

process.on('unhandledRejection', (err) => {
  logger.error('unhandledRejection', { err: String(err) });
});
