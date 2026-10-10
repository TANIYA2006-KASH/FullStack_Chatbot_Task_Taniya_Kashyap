import { AppError } from '../utils/AppError.js';

export const notFound = (_req, _res, next) => next(new AppError(404, 'Route not found'));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, message: err.message, errors: err.details });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }
  // Anything else is unexpected: log details on the server, send a generic message to the client.
  console.error('[error]', err);
  return res.status(500).json({ success: false, message: 'Something went wrong on our side. Please try again later.' });
}
