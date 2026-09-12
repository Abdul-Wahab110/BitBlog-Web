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

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/sitemap.xml', SitemapController.getSitemapXml);
app.get('/robots.txt', RobotsController.getRobotsTxt);
app.get('/api/sitemap.xml', SitemapController.getSitemapXml);
app.get('/api/robots.txt', RobotsController.getRobotsTxt);

app.use('/api', apiRateLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

app.use('/api', apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;

