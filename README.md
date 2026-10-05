# Smallbean

Smallbean is an appointment-booking and business-management application for independent service providers and small teams in South Africa. It gives businesses a shareable booking page and a workspace to manage services, availability, customers, and appointments.

## The problem

Many small service businesses coordinate appointments through calls, messaging apps, paper diaries, or spreadsheets. These disconnected tools take time away from paid work, make availability harder to communicate, and can lead to missed or conflicting bookings. Smaller businesses may also lack the time or budget to build and maintain their own online booking system.

This project explores a practical, low-friction way to help those businesses participate in digital commerce. These statements describe the product motivation, not a quantified research finding.

## The solution

Smallbean brings service listings, business hours, booking rules, and available appointment times into one responsive web application. Customers can book through a public page, while the business manages its schedule and customer records from a dashboard.

## Current features

- Public business booking pages with service descriptions, prices, durations, and available times.
- Availability calculations that account for working hours, time off, booking windows, and existing appointments.
- Appointment management links for customer cancellation and rescheduling, subject to business rules.
- Business dashboard for appointments, customers, services, staff, working hours, time off, and analytics.
- Account registration, sign-in, email-verification and password-reset token flows.
- Tenant-scoped business data and role-aware organization membership.
- Queued email notifications. Delivery requires a configured email provider and a trusted scheduler.
- Stripe subscription checkout, billing portal, and webhook handling. These require Stripe configuration.
- GitHub Actions checks for typechecking, tests, database validation, and a production build check.

Google and Microsoft calendar connection code is present, but full calendar synchronization and conflict handling remain future work.

## Technology stack

- Next.js 16, React 19, TypeScript, and Node.js 22.
- Prisma ORM with a MySQL-compatible database. The current deployment configuration uses MariaDB.
- `jose` and `bcryptjs` for signed sessions and password hashing.
- Stripe for subscription billing; Upstash Redis and Sentry are optional integrations.
- GitHub Actions for continuous integration.

## Planned AWS services

AWS deployment is planned and is not implemented in this repository yet. The current configuration targets a MariaDB database outside AWS. The proposed AWS architecture is:

- Amazon ECS on AWS Fargate to run the containerized Next.js application, with Amazon ECR for container images.
- Amazon RDS for MySQL for managed relational storage, after validating the existing MariaDB schema and migrations against the selected engine.
- AWS Secrets Manager for database credentials, authentication secrets, and third-party API credentials.
- Amazon CloudWatch for application logs, metrics, dashboards, and operational alarms.
- Amazon SES for transactional email delivery.
- Amazon S3 for encrypted backup and export storage, with access restricted by IAM policies.
- AWS Certificate Manager and Amazon Route 53 for TLS certificates and DNS if the domain is moved to AWS-managed infrastructure.

The deployment plan includes least-privilege IAM roles, encryption in transit and at rest, managed database backups, and environment-specific configuration. These are goals for the AWS implementation, not claims about the current deployment.

## Development status

Smallbean is an actively developed MVP. The core booking, account, business-management, and billing flows are represented in the application, with domain tests and a GitHub Actions workflow. The repository is not currently deployed on AWS. Production readiness still depends on configuring external providers, validating operational controls, and completing a security and deployment review.

## Future improvements

- Deploy the application and database to the planned AWS architecture and automate releases from GitHub Actions using OIDC.
- Complete Google and Microsoft calendar synchronization, including refresh-token lifecycle and conflict policy.
- Configure and monitor transactional email delivery and scheduled notification processing.
- Add integration tests for authentication, tenant isolation, bookings, billing webhooks, and notification retries.
- Validate database migration and restore procedures against the production database engine.
- Complete load, accessibility, security, and disaster-recovery testing before production use.

## Run locally

Prerequisites: Node.js 22 and a MySQL-compatible database. Copy `.env.example` to `.env` and configure `DATABASE_URL` and a strong `AUTH_SECRET` before running database-backed flows.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. The demo dashboard is at `/dashboard`; the public booking page is at `/book/sample-studio`.

## Useful commands

```bash
npm test
npm run typecheck
npm run db:validate
npm run build:check
npm run ci:check
```

`npm run build` applies pending migrations before building. Database backup scripts are available at `scripts/backup-database.sh` and `scripts/backup-database.ps1`; test restore procedures and keep backups in separate, access-controlled storage.
