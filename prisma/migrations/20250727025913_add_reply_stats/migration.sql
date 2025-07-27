-- CreateTable
CREATE TABLE "ReplyStats" (
    "id" SERIAL NOT NULL,
    "replyId" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReplyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplyStats_replyId_key" ON "ReplyStats"("replyId");

-- CreateIndex
CREATE INDEX "ReplyStats_replyId_idx" ON "ReplyStats"("replyId");

-- AddForeignKey
ALTER TABLE "ReplyStats" ADD CONSTRAINT "ReplyStats_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Reply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
