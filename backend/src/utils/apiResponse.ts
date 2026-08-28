import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  public static success<T>(res: Response, data: T, message = 'Operation successful', statusCode = 200): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  public static error(res: Response, message = 'An error occurred', statusCode = 400, errors: string[] = []): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      errors: errors.length > 0 ? errors : [message],
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
