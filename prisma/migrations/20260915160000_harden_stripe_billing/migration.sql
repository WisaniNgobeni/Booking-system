ALTER TABLE `Subscription`
    MODIFY `status` ENUM('TRIALING', 'ACTIVE', 'PAST_DUE', 'INCOMPLETE', 'CANCELED') NOT NULL DEFAULT 'TRIALING',
    ADD COLUMN `providerPriceId` VARCHAR(191) NULL,
    ADD COLUMN `providerProductId` VARCHAR(191) NULL,
    ADD COLUMN `currency` VARCHAR(191) NULL,
    ADD COLUMN `currentPeriodStart` DATETIME(3) NULL,
    ADD COLUMN `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canceledAt` DATETIME(3) NULL,
    ADD COLUMN `trialEnd` DATETIME(3) NULL,
    ADD COLUMN `lastStripeEventCreatedAt` DATETIME(3) NULL,
    ADD COLUMN `lastSyncedAt` DATETIME(3) NULL;

CREATE INDEX `Subscription_providerPriceId_idx` ON `Subscription`(`providerPriceId`);
CREATE INDEX `Subscription_providerProductId_idx` ON `Subscription`(`providerProductId`);

ALTER TABLE `BillingEvent`
    ADD COLUMN `status` ENUM('PROCESSING', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    ADD COLUMN `errorMessage` VARCHAR(191) NULL,
    ADD COLUMN `stripeCreatedAt` DATETIME(3) NULL,
    ADD COLUMN `processingStartedAt` DATETIME(3) NULL,
    ADD COLUMN `organizationId` VARCHAR(191) NULL,
    ADD COLUMN `providerSubscriptionId` VARCHAR(191) NULL;

CREATE INDEX `BillingEvent_status_processedAt_idx` ON `BillingEvent`(`status`, `processedAt`);
CREATE INDEX `BillingEvent_organizationId_stripeCreatedAt_idx` ON `BillingEvent`(`organizationId`, `stripeCreatedAt`);
CREATE INDEX `BillingEvent_providerSubscriptionId_idx` ON `BillingEvent`(`providerSubscriptionId`);