-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTROS',
    "userId" TEXT,
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "id", "imageUrl", "isActive", "name", "priceCents", "updatedAt") SELECT "category", "createdAt", "description", "id", "imageUrl", "isActive", "name", "priceCents", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
CREATE INDEX "Product_userId_idx" ON "Product"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
