import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { apiRateLimiter } from './middleware/rateLimiter';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { SitemapController, RobotsController } from './controllers/apiControllers';

const app: Application = express();

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Serve Uploaded Media Files Statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve Root & API Technical SEO Endpoints (/sitemap.xml & /robots.txt)
app.get('/sitemap.xml', SitemapController.getSitemapXml);
app.get('/robots.txt', RobotsController.getRobotsTxt);
app.get('/api/sitemap.xml', SitemapController.getSitemapXml);
app.get('/api/robots.txt', RobotsController.getRobotsTxt);

// Rate Limiting Guard
app.use('/api', apiRateLimiter);

// JSON Body Parser & URL Encoding
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom Request Logger
app.use(requestLogger);

// Mount API Route Foundation
app.use('/api', apiRoutes);

// 404 API Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

export default app;
