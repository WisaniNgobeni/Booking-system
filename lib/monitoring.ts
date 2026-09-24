import * as Sentry from "@sentry/nextjs";

export function captureException(error: unknown, context?: Record<string, unknown>) {
    if (!process.env.SENTRY_DSN) return;
    Sentry.withScope((scope) => {
        if (context) scope.setExtras(context);
        Sentry.captureException(error);
    });
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
    if (!process.env.SENTRY_DSN) return;
    Sentry.withScope((scope) => {
        if (context) scope.setExtras(context);
        Sentry.captureMessage(message);
    });
}
