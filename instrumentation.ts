import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // this is your Sentry.init call from `sentry.server.config.js`
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // this is your Sentry.init call from `sentry.edge.config.js`
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;

