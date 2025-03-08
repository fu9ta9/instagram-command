/*
  Warnings:

  - You are about to drop the column `accountId` on the `Reply` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `igAccountId` to the `Reply` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_accountId_fkey";

-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "accountId",
ADD COLUMN     "igAccountId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "IGAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profilePictureUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "expiresAt" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IGAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IGAccount_instagramId_key" ON "IGAccount"("instagramId");

-- CreateIndex
CREATE INDEX "IGAccount_userId_idx" ON "IGAccount"("userId");

-- AddForeignKey
ALTER TABLE "IGAccount" ADD CONSTRAINT "IGAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_igAccountId_fkey" FOREIGN KEY ("igAccountId") REFERENCES "IGAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
