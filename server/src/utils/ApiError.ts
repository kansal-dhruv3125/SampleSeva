/**
 * Error with an HTTP status code, used by services/controllers to signal
 * expected API failures (404, 409, ...). The central error handler converts
 * it into the standard failure response shape.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;

  constructor(statusCode: number, message: string, errorCode = "ApiError") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
