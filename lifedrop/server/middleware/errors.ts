import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

export const asyncHandler =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid input', issues: err.issues });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  console.error('[API error]', err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
}
