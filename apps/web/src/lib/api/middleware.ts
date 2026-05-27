import { NextResponse } from 'next/server';

/**
 * API Middleware Utilities
 * Provides auth validation, rate limiting, request validation, and error handling.
 */

// ===== Rate Limiting =====
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetIn: number } {
  const { maxRequests = 20, windowMs = 60 * 1000 } = options;
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, val] of rateLimitStore.entries()) {
      if (val.resetTime < now) rateLimitStore.delete(key);
    }
  }

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetIn = entry.resetTime - now;

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn };
}

// ===== Error Response Helpers =====
export function apiError(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      error: message,
      ...(details && process.env.NODE_ENV === 'development' ? { details } : {}),
    },
    {
      status,
      headers: { 'X-Error': 'true' },
    }
  );
}

export function apiSuccess(data: any, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

// ===== Request Validation =====
export function validateBody<T extends Record<string, any>>(
  body: any,
  requiredFields: (keyof T)[]
): { valid: true; data: T } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return { valid: false, error: `Field "${String(field)}" is required` };
    }
  }

  return { valid: true, data: body as T };
}

// ===== IP Extraction =====
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

// ===== Content Size Check =====
export function checkContentSize(body: string, maxBytes: number = 500_000): boolean {
  return new Blob([body]).size <= maxBytes;
}

// ===== Sanitize Input =====
export function sanitizeString(input: string, maxLength: number = 10000): string {
  return input.slice(0, maxLength).trim();
}
