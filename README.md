# Smallbean Booking System

Smallbean is a booking management platform I am developing to help small service-based businesses digitise their appointment management.

## The problem

Many small businesses still manage appointments through WhatsApp, phone calls, social media messages, and manual calendars. Keeping availability and customer conversations across separate tools takes time and can make it harder to avoid missed or conflicting bookings.

## The solution

Smallbean aims to provide a simple digital booking system that lets businesses manage their services and availability while allowing customers to book online through a shareable booking page.

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

## AWS re/Start showcase

This project was started independently before I joined the AWS re/Start programme. I am using it as my AWS re/Start showcase project to apply the cloud, networking, security, Linux, Python, database, and automation skills I am learning throughout the programme.

### Current status

**Status: Work in Progress**

Smallbean is not currently launch-ready. The core application and booking experience are under active development. The purpose of this repository is to document the project's development and demonstrate how I am applying the skills gained through AWS re/Start.

### AWS re/Start implementation goals

AWS services and infrastructure below are planned work; they are not implemented or currently in use by this project.

| Area | Planned application | Status |
| --- | --- | --- |
| Cloud | Deploy the application using AWS infrastructure, initially evaluating Amazon ECS on AWS Fargate and Amazon ECR. | Planned |
| Networking | Design a secure VPC and network layout for the application and database. | Planned |
| Security | Apply least-privilege IAM, secure secret storage, and encryption in transit and at rest. | Planned |
| Database | Evaluate Amazon RDS for MariaDB or MySQL and validate schema, migration, backup, and restore compatibility. | Planned |
| Linux | Build and operate Linux-based application workloads; practice configuration, updates, and troubleshooting. | Planned |
| Python | Develop Python scripts for operational tooling and repeatable cloud tasks. | Planned |
| Monitoring | Use Amazon CloudWatch for logs, metrics, dashboards, and alarms. | Planned |
| Automation | Automate repeatable infrastructure, deployment, and operational tasks. | Planned |
| Storage | Evaluate Amazon S3 for appropriate assets, exports, or encrypted backups. | Planned |
| DNS/CDN | Evaluate Amazon Route 53 for DNS and Amazon CloudFront for content delivery. | Planned |
| Infrastructure as Code | Explore AWS CloudFormation to define and reproduce infrastructure. | Planned |
| CI/CD | Extend the existing GitHub Actions workflow to deploy to AWS, using OIDC for AWS access where appropriate. | Planned |

### Future improvements

- Implement the AWS roadmap incrementally and document architecture decisions and security trade-offs.
- Complete Google and Microsoft calendar synchronization, including token lifecycle and conflict handling.
- Configure and monitor transactional email delivery and scheduled notification processing.
- Add integration tests for authentication, tenant isolation, bookings, billing webhooks, and notification retries.
- Validate database migration and restore procedures against the selected AWS database engine.
- Complete load, accessibility, security, and disaster-recovery testing before any production launch.

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
