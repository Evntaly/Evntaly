import * as winston from 'winston';
import { winstonEnricher } from './winston.enricher';

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winstonEnricher(),
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : '';
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        }),
      ),
    }),
  ],
  // Default meta data to include in all logs
  defaultMeta: {
    service: 'evntaly-backend',
    environment: process.env.NODE_ENV || 'development',
  },
};
