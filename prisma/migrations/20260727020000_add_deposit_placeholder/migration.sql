-- CreateEnum
CREATE TYPE "DepositPaymentMethod" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD', 'STUDY_LINK');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('NOT_PAID', 'PAID');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "depositMethod" "DepositPaymentMethod",
ADD COLUMN     "depositPaidAt" TIMESTAMP(3),
ADD COLUMN     "depositStatus" "DepositStatus" NOT NULL DEFAULT 'NOT_PAID';

