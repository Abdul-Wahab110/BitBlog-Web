export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];

  constructor(message: string, statusCode = 500, errors: string[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

