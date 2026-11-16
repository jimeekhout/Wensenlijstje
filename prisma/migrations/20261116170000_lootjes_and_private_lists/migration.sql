-- AlterTable
ALTER TABLE "WishList" ADD COLUMN "accessHash" TEXT;

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "budgetCents" INTEGER,
    "ownerId" TEXT NOT NULL,
    "drawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawParticipant" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "token" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "drawsParticipantId" TEXT,
    "wishShareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawExclusion" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,

    CONSTRAINT "DrawExclusion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Draw_ownerId_idx" ON "Draw"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawParticipant_token_key" ON "DrawParticipant"("token");

-- CreateIndex
CREATE INDEX "DrawParticipant_drawId_idx" ON "DrawParticipant"("drawId");

-- CreateIndex
CREATE INDEX "DrawExclusion_drawId_idx" ON "DrawExclusion"("drawId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawExclusion_drawId_aId_bId_key" ON "DrawExclusion"("drawId", "aId", "bId");

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawParticipant" ADD CONSTRAINT "DrawParticipant_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawExclusion" ADD CONSTRAINT "DrawExclusion_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;
