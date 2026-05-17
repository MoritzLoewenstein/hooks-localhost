/*
  Warnings:

  - You are about to drop the column `method` on the `webhook_endpoints` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_webhook_endpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "methods" JSONB NOT NULL DEFAULT [],
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhook_endpoints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_webhook_endpoints" ("created_at", "id", "target", "user_id") SELECT "created_at", "id", "target", "user_id" FROM "webhook_endpoints";
DROP TABLE "webhook_endpoints";
ALTER TABLE "new_webhook_endpoints" RENAME TO "webhook_endpoints";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
