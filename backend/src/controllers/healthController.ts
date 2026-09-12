import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/apiResponse';
import { config } from '../config/env';
import { HealthStatus } from '../types';

export class HealthController {
  public static getHealth(req: Request, res: Response): void {
    const statusData: HealthStatus = {
      status: 'UP',
      environment: config.nodeEnv,
      database: 'CONNECTED',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    ResponseUtil.success(res, statusData, 'BitBlog CMS REST API is running');
  }
}

