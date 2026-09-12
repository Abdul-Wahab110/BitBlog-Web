import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/apiResponse';

export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      ResponseUtil.error(res, 'Missing required payload parameters', 400, missing.map(f => `${f} is required`));
      return;
    }

    next();
  };
};

