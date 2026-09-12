import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ResponseUtil } from '../utils/apiResponse';
import { Logger } from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error(`API Error on ${req.method} ${req.originalUrl}:`, err);

  if (err instanceof ApiError) {
    ResponseUtil.error(res, err.message, err.statusCode, err.errors);
    return;
  }

  ResponseUtil.error(res, 'Internal server unexpected error', 500);
};

