/*
  Warnings:

  - You are about to drop the column `businessGoal` on the `Business` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Business" DROP COLUMN "businessGoal",
ADD COLUMN     "aiPreferences" JSONB,
ADD COLUMN     "businessStage" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "profile" JSONB,
ADD COLUMN     "timezone" TEXT;
