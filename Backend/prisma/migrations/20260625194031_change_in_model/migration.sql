/*
  Warnings:

  - Added the required column `EmployeeId` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "EmployeeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_EmployeeId_fkey" FOREIGN KEY ("EmployeeId") REFERENCES "Employee"("EmployeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
