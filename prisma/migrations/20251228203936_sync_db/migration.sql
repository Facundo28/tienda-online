/*
  Warnings:

  - Added the required column `updatedAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogisticsCompany" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LogisticsCompany_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "executorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'NOT_RECEIVED',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Claim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryMethod" TEXT NOT NULL DEFAULT 'PICKUP',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "pickupCode" TEXT,
    "fundsReleased" BOOLEAN NOT NULL DEFAULT false,
    "fundsReleaseAt" DATETIME,
    "scanLatitude" REAL,
    "scanLongitude" REAL,
    "totalCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    "securityKeywords" TEXT,
    "proofUrl" TEXT,
    "deliveryLat" REAL,
    "deliveryLng" REAL,
    "deliveryTime" DATETIME,
    "courierId" TEXT,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("addressLine1", "addressLine2", "city", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryMethod", "deliveryStatus", "fundsReleased", "id", "pickupCode", "postalCode", "state", "status", "totalCents", "userId") SELECT "addressLine1", "addressLine2", "city", "createdAt", "customerEmail", "customerName", "customerPhone", "deliveryMethod", "deliveryStatus", "fundsReleased", "id", "pickupCode", "postalCode", "state", "status", "totalCents", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityDocUrl" TEXT,
    "reputationScore" INTEGER NOT NULL DEFAULT 50,
    "reputationTier" TEXT NOT NULL DEFAULT 'NARANJA',
    "addressInstructions" TEXT,
    "addressType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorSecret" TEXT,
    "enabled2FAMethods" TEXT NOT NULL DEFAULT '',
    "phoneCountryCode" TEXT,
    "otpCode" TEXT,
    "otpExpiresAt" DATETIME,
    "workerOfId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_workerOfId_fkey" FOREIGN KEY ("workerOfId") REFERENCES "LogisticsCompany" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("addressLine1", "addressLine2", "avatarUrl", "city", "createdAt", "email", "id", "isActive", "name", "passwordHash", "phone", "postalCode", "role", "state", "updatedAt") SELECT "addressLine1", "addressLine2", "avatarUrl", "city", "createdAt", "email", "id", "isActive", "name", "passwordHash", "phone", "postalCode", "role", "state", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticsCompany_ownerId_key" ON "LogisticsCompany"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_orderId_key" ON "Claim"("orderId");
