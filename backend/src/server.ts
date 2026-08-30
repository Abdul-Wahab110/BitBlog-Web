import app from './app';
import { config } from './config/env';
import { Database } from './config/database';
import { Logger } from './utils/logger';
import { SchedulerService } from './services/schedulerService';

const PORT = config.port;

const startServer = async () => {
  try {

    await Database.initialize();

    SchedulerService.start(5000);

    const server = app.listen(PORT, () => {
      Logger.info(`[BitBlog REST API] Server listening on port ${PORT} in [${config.nodeEnv}] mode.`);
      Logger.info(`[Health Check Endpoint] http://localhost:${PORT}/api/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      Logger.info(`[Server Shutdown] Received ${signal} signal. Shutting down gracefully...`);
      SchedulerService.stop();
      server.close(async () => {
        Logger.info('[Server Shutdown] HTTP server closed.');
        await Database.closePool();
        Logger.info('[Server Shutdown] Process exiting cleanly.');
        process.exit(0);
      });

      setTimeout(() => {
        Logger.error('[Server Shutdown] Could not close connections in time, forcing process exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    Logger.error('[Server Start] Fatal startup error:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

