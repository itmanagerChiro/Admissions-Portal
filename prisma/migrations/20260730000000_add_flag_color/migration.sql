-- CreateEnum
CREATE TYPE "FlagColor" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "flagColor" "FlagColor";

