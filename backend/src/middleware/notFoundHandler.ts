import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/apiResponse';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  ResponseUtil.error(res, `Cannot ${req.method} ${req.originalUrl} - Endpoint API route not found`, 404);
};
