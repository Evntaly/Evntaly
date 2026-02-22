import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';

dotenv.config({ path: path.resolve(__dirname, envFile) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import * as express from 'express';

import * as winston from 'winston';
import { winstonConfig } from './@core/helpers';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const logger = winston.createLogger(winstonConfig);

  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? WinstonModule.createLogger(winstonConfig)
        : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(express.json({ limit: '1mb', type: 'application/json' }));

  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  app.setGlobalPrefix('api');
  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
  });

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
      ],
      tracesSampleRate: 0.5,
    });
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
  }

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.info(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
