type RateLimitInfo = {
  count: number;
  resetTime: number;
};

const rateLimits = new Map<string, RateLimitInfo>();

export function rateLimit(ip: string, limit: number, windowMs: number): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const info = rateLimits.get(ip);

  if (!info || info.resetTime < now) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (info.count >= limit) {
    return { success: false, limit, remaining: 0, reset: info.resetTime };
  }

  info.count += 1;
  return { success: true, limit, remaining: limit - info.count, reset: info.resetTime };
}

// Clean up expired entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimits.entries()) {
    if (info.resetTime < now) {
      rateLimits.delete(ip);
    }
  }
}, 60000); // Clean up every minute
