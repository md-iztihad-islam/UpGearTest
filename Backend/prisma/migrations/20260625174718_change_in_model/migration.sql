/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Email` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "Email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_Email_key" ON "Employee"("Email");
