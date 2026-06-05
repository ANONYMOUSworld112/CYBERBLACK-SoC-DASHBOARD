import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  if (status >= 500) {
    logger.error('unhandled', { err: err.message, stack: err.stack, path: req.path });
  } else {
    logger.warn('client-error', { err: err.message, path: req.path });
  }
  res.status(status).json({ error: err.message || 'INTERNAL_ERROR' });
}
