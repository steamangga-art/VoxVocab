/*
  Warnings:

  - You are about to drop the column `major` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identifier]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "QuizScore_userId_academicYear_idx";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "major";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identifier" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_identifier_key" ON "User"("identifier");
