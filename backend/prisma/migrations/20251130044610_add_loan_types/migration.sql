/*
  Warnings:

  - You are about to drop the column `borrower` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `otherParty` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('BORROWED', 'LENT');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ACTIVE', 'PAID', 'OVERDUE');

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "borrower",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "otherParty" TEXT NOT NULL,
ADD COLUMN     "status" "LoanStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "type" "LoanType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
