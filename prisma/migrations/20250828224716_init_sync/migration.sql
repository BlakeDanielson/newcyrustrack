/*
  Warnings:

  - You are about to drop the `ConsumptionSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."ConsumptionSession";

-- CreateTable
CREATE TABLE "public"."consumption_sessions" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "who_with" TEXT NOT NULL,
    "vessel" TEXT NOT NULL,
    "accessory_used" TEXT NOT NULL,
    "my_vessel" BOOLEAN NOT NULL DEFAULT true,
    "my_substance" BOOLEAN NOT NULL DEFAULT true,
    "strain_name" TEXT NOT NULL,
    "thc_percentage" DOUBLE PRECISION,
    "purchased_legally" BOOLEAN NOT NULL DEFAULT true,
    "state_purchased" TEXT,
    "tobacco" BOOLEAN NOT NULL DEFAULT false,
    "kief" BOOLEAN NOT NULL DEFAULT false,
    "concentrate" BOOLEAN NOT NULL DEFAULT false,
    "quantity" TEXT NOT NULL,
    "quantity_legacy" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consumption_sessions_pkey" PRIMARY KEY ("id")
);
