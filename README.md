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
```

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

The public booking flow validates contact details, booking windows, working hours, time off, and conflicts. Customer management links enforce cancellation and rescheduling policy. Before first deployment, create and review the initial Prisma migration for the target database, configure email delivery for queued notifications, and verify backups, monitoring, rate limiting, and HTTPS at the hosting layer.
