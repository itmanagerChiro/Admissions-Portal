-- AlterEnum
BEGIN;
CREATE TYPE "DepositPaymentMethod_new" AS ENUM ('BANK_TRANSFER', 'CREDIT_CARD');
ALTER TABLE "Application" ALTER COLUMN "depositMethod" TYPE "DepositPaymentMethod_new" USING ("depositMethod"::text::"DepositPaymentMethod_new");
ALTER TYPE "DepositPaymentMethod" RENAME TO "DepositPaymentMethod_old";
ALTER TYPE "DepositPaymentMethod_new" RENAME TO "DepositPaymentMethod";
DROP TYPE "public"."DepositPaymentMethod_old";
COMMIT;

-- AlterEnum
ALTER TYPE "DepositStatus" ADD VALUE 'PENDING_REVIEW';

