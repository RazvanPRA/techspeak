-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "referenceText" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "pronunciationScore" DOUBLE PRECISION NOT NULL,
    "accuracyScore" DOUBLE PRECISION NOT NULL,
    "fluencyScore" DOUBLE PRECISION NOT NULL,
    "prosodyScore" DOUBLE PRECISION,
    "completenessScore" DOUBLE PRECISION NOT NULL,
    "words" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioAnswer" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "body" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_answerId_key" ON "Feedback"("answerId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "ScenarioAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
