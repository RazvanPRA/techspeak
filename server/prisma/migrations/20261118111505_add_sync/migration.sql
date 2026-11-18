-- CreateTable
CREATE TABLE "SyncedShadowingAttempt" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "deckId" TEXT NOT NULL,
    "sentenceIndex" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "transcript" TEXT NOT NULL,
    "words" JSONB NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedShadowingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedPairAttempt" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "pairId" TEXT NOT NULL,
    "sound" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedPairAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedVocabularyState" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "deckId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "ease" DOUBLE PRECISION NOT NULL,
    "interval" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lapses" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedVocabularyState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedScenarioAnswer" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "promptId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "durationSeconds" DOUBLE PRECISION NOT NULL,
    "wordsPerMinute" INTEGER NOT NULL,
    "fillers" INTEGER NOT NULL,
    "score" INTEGER,
    "transcript" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedScenarioAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedTalk" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "durationSeconds" DOUBLE PRECISION NOT NULL,
    "transcript" TEXT NOT NULL,
    "wordsPerMinute" INTEGER NOT NULL,
    "fillers" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncedTalk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncedShadowingAttempt_seq_key" ON "SyncedShadowingAttempt"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedPairAttempt_seq_key" ON "SyncedPairAttempt"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedVocabularyState_seq_key" ON "SyncedVocabularyState"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedScenarioAnswer_seq_key" ON "SyncedScenarioAnswer"("seq");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedTalk_seq_key" ON "SyncedTalk"("seq");
