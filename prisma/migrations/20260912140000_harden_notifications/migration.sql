-- Extend notification state for atomic worker claims
ALTER TABLE `Notification` MODIFY `status` ENUM('QUEUED', 'PROCESSING', 'SENT', 'FAILED') NOT NULL DEFAULT 'QUEUED';
ALTER TABLE `Notification` ADD COLUMN `claimedAt` DATETIME(3) NULL;
