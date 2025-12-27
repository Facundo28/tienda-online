-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OTROS',
    "priceCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "imageUrl", "isActive", "name", "priceCents", "updatedAt") SELECT "createdAt", "description", "id", "imageUrl", "isActive", "name", "priceCents", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
