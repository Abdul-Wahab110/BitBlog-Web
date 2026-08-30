import { Request, Response, NextFunction } from 'express';

export const apiRateLimiter = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

