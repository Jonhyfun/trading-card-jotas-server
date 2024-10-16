/*
  Warnings:

  - You are about to drop the column `deckId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userFirebaseId]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userFirebaseId` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_deckId_fkey";

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "userFirebaseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deckId";

-- CreateIndex
CREATE UNIQUE INDEX "Deck_userFirebaseId_key" ON "Deck"("userFirebaseId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_userFirebaseId_fkey" FOREIGN KEY ("userFirebaseId") REFERENCES "User"("firebaseId") ON DELETE RESTRICT ON UPDATE CASCADE;
