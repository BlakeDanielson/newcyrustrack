-- AlterTable
ALTER TABLE "public"."ConsumptionSession" ADD COLUMN     "device" TEXT,
ADD COLUMN     "lat" DECIMAL(9,6),
ADD COLUMN     "lng" DECIMAL(9,6),
ADD COLUMN     "quantity" DECIMAL(10,2),
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "sessionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "socialContext" TEXT,
ADD COLUMN     "strain" TEXT,
ADD COLUMN     "unit" TEXT;
