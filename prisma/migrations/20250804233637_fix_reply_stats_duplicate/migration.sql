-- AlterTable
ALTER TABLE "Reply" ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text';

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "replyId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
