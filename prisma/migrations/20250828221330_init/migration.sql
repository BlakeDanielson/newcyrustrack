-- CreateTable
CREATE TABLE "public"."ConsumptionSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ConsumptionSession_pkey" PRIMARY KEY ("id")
);
