import winston from 'winston';
import { config } from '../config.js';

const { combine, timestamp, printf, colorize } = winston.format;

const fmt = printf(({ level, message, timestamp: ts, ...meta }) => {
  const tail = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  return `${ts} ${level} ${message}${tail}`;
});

export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize(), fmt),
  transports: [new winston.transports.Console()],
});
