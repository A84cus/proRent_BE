/*
  Warnings:

  - The values [TENANT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Prorent"."Role_new" AS ENUM ('USER', 'OWNER');
ALTER TABLE "Prorent"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Prorent"."User" ALTER COLUMN "role" TYPE "Prorent"."Role_new" USING ("role"::text::"Prorent"."Role_new");
ALTER TYPE "Prorent"."Role" RENAME TO "Role_old";
ALTER TYPE "Prorent"."Role_new" RENAME TO "Role";
DROP TYPE "Prorent"."Role_old";
ALTER TABLE "Prorent"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
