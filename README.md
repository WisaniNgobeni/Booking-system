# Tandem

Tandem is a booking experience for service businesses. This repository currently contains the first validated product slice: a polished marketing page, a responsive dashboard overview, and a public booking flow with service selection, date/time selection, and confirmation state.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The demo dashboard is at `/dashboard` and the public booking page is at `/book/studio-moya`.

## Commands

```bash
npm run build   # production compile
npm run start   # serve the production build
 npm run lint    # TypeScript validation
 npm test        # domain tests
npm run db:validate
npm run db:generate
npm run db:migrate
npm run ci:check
```

Database backups can be run with `./scripts/backup-database.sh` on Linux or `./scripts/backup-database.ps1` on Windows. The scripts retain the newest 14 dumps; copy completed dumps to separate storage and test restoration regularly.

## Production configuration

Copy `.env.example` to `.env` and set your Hostinger MariaDB `DATABASE_URL` plus a long random `AUTH_SECRET`. Production requests fail closed when persistence is not configured. Generate the Prisma client, apply migrations, build, and serve the production bundle:

```bash
npm run db:generate
npm run db:deploy
npm run build
npm start
```

After deployment, check `/api/health`. It should return `{"ok":true,"database":"connected"}`.

To deliver booking confirmation emails, configure `EMAIL_PROVIDER_KEY` and `EMAIL_FROM`, then call `POST /api/notifications/process` periodically with `Authorization: Bearer CRON_SECRET` from a trusted scheduler.

For SaaS billing, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, and `STRIPE_PRICE_BUSINESS`. Register `POST /api/billing/webhook` in Stripe, enable the customer portal, and use the authenticated checkout and portal endpoints from the dashboard billing UI.

The public booking flow validates contact details, booking windows, working hours, time off, and conflicts. Customer management links enforce cancellation and rescheduling policy. Before first deployment, create and review the initial Prisma migration for the target database, configure email delivery for queued notifications, and verify backups, monitoring, rate limiting, and HTTPS at the hosting layer.

## Production launch checklist

- Run CI against every pull request: `npm run ci:check`.
- Apply migrations before starting the new application release: `npm run db:deploy`.
- Configure a trusted scheduler for `POST /api/notifications/process` with `Authorization: Bearer CRON_SECRET`.
- Register Stripe `checkout.session.completed` and `customer.subscription.*` webhooks at `/api/billing/webhook`.
- Configure Resend domain authentication, `EMAIL_FROM`, and delivery monitoring.
- Use Redis or a platform-backed rate limiter before running more than one application instance.
- Enable automated MariaDB backups and test restoration before accepting live bookings.
- Monitor `/api/health`, application errors, webhook failures, queue age, and database capacity.
- Complete Google/Outlook OAuth sync only after choosing token storage, conflict policy, and a background-job provider.
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` before running multiple application instances; the local limiter is only a development fallback.
- Set `SENTRY_DSN` to enable server-side error capture and configure alert rules for failed webhooks, queue age, and database errors.
- Register Google and Microsoft callback URLs as `/api/calendar/google/callback` and `/api/calendar/microsoft/callback`.
- Configure the GitHub `DEPLOY_COMMAND` production secret for the hosting provider used by `.github/workflows/deploy.yml`.
