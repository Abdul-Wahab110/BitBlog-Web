import { Request, Response, NextFunction } from 'express';

// Disabled rate limiter middleware to allow unlimited requests during local development
export const apiRateLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
