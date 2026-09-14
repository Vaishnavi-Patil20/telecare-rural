export class AppError extends Error {
  constructor(public statusCode: number, message: string, public code = 'APP_ERROR') {
    super(message);
  }
}
export const Unauthorized = (m = 'Unauthorized') => new AppError(401, m, 'UNAUTHORIZED');
export const Forbidden = (m = 'Forbidden') => new AppError(403, m, 'FORBIDDEN');
export const NotFound = (m = 'Not found') => new AppError(404, m, 'NOT_FOUND');
export const Conflict = (m = 'Conflict') => new AppError(409, m, 'CONFLICT');
export const BadRequest = (m = 'Bad request') => new AppError(400, m, 'BAD_REQUEST');
