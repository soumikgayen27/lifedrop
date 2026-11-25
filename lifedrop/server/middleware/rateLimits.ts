import rateLimit from 'express-rate-limit';

const base = { standardHeaders: true, legacyHeaders: false } as const;
const msg = (error: string) => ({ error });

export const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 300, message: msg('Too many requests. Please slow down.') });
export const contactLimiter = rateLimit({ ...base, windowMs: 60 * 60_000, limit: 5, message: msg('Too many messages sent. Please try again later.') });
export const requestLimiter = rateLimit({ ...base, windowMs: 60 * 60_000, limit: 10, message: msg('You have submitted many requests recently. Please try again later.') });
export const adminLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 120, message: msg('Too many admin requests.') });
