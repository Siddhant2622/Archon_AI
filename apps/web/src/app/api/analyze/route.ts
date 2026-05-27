import { NextResponse } from 'next/server';
import { checkRateLimit, apiError, apiSuccess, getClientIP, sanitizeString } from '@/lib/api/middleware';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`analyze:${clientIP}`, { maxRequests: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return apiError('Rate limit exceeded. Please wait before trying again.', 429);
    }

    const body = await request.json();
    const code = body?.code;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return apiError('Code is required for analysis');
    }

    // Limit input size (500KB)
    const sanitizedCode = sanitizeString(code, 500_000);

    if (!process.env.GEMINI_API_KEY) {
      return apiError('Gemini API key not configured. Please add GEMINI_API_KEY to your environment.', 500);
    }

    const { analyzeCode } = await import('@/lib/gemini/client');
    const result = await analyzeCode(sanitizedCode);

    return apiSuccess(result, 200);
  } catch (error: any) {
    console.error('Analysis error:', error);

    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      return apiError('AI rate limit reached. Please wait a moment and try again.', 429);
    }

    return apiError(
      error.message || 'Internal server error during analysis',
      error.status || 500
    );
  }
}
