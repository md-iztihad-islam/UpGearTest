/*
  Warnings:

  - You are about to drop the column `EmployeeNumber` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `OTP` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `OTPExpires` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `OTP` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `OTPExpires` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `StoreNumber` on the `Store` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Employee_EmployeeNumber_key";

-- DropIndex
DROP INDEX "Store_StoreNumber_key";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "EmployeeNumber",
DROP COLUMN "OTP",
DROP COLUMN "OTPExpires";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "OTP",
DROP COLUMN "OTPExpires",
DROP COLUMN "StoreNumber";
