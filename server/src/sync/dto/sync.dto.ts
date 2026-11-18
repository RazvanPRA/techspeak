import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SYNC_PAGE_SIZE } from '../sync.types.js';

// Request and response shapes of /sync (sync.types.ts is the TypeScript source of truth).

const ID_EXAMPLE = '3f9c2a7be0d14c4f9a51c0e2d7b8a613';

class RecordDto {
  @ApiProperty({
    example: ID_EXAMPLE,
    description: 'Made by the app; uploading it twice changes nothing',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  id!: string;
}

class CreatedRecordDto extends RecordDto {
  @ApiProperty({ example: '2026-11-18T09:00:00.000Z' })
  @IsISO8601({ strict: true })
  createdAt!: string;
}

class SpokenRecordDto extends CreatedRecordDto {
  @ApiProperty({ example: 42.5 }) @IsNumber() @Min(0) durationSeconds!: number;
  @ApiProperty({ example: 'I would add an index' })
  @IsString()
  @MaxLength(20_000)
  transcript!: string;
  @ApiProperty({ example: 120 }) @IsInt() @Min(0) wordsPerMinute!: number;
  @ApiProperty({ example: 2 }) @IsInt() @Min(0) fillers!: number;
}

export class ShadowingAttemptDto extends CreatedRecordDto {
  @ApiProperty({ example: 'sql' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  deckId!: string;
  @ApiProperty({ example: 0 }) @IsInt() @Min(0) sentenceIndex!: number;
  @ApiProperty({ example: 80 }) @IsInt() @Min(0) score!: number;
  @ApiProperty({ example: 'select star from users' })
  @IsString()
  @MaxLength(2000)
  transcript!: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'object' },
    description: "The app's per-word diff, stored as is",
  })
  @IsArray()
  @ArrayMaxSize(200)
  words!: unknown[];

  @ApiPropertyOptional({
    type: 'object',
    nullable: true,
    additionalProperties: true,
    description: 'Azure sub-scores, null for on-device scoring',
  })
  @IsOptional()
  @IsObject()
  details!: Record<string, unknown> | null;
}

export class PairAttemptDto extends CreatedRecordDto {
  @ApiProperty({ example: 'ship-sheep' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  pairId!: string;
  @ApiProperty({ example: 'ɪ-iː' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  sound!: string;
  @ApiProperty({ enum: ['listen', 'say'] }) @IsIn(['listen', 'say']) mode!:
    'listen' | 'say';
  @ApiProperty() @IsBoolean() correct!: boolean;
}

export class VocabularyStateDto extends RecordDto {
  @ApiProperty({ example: 'sql' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  deckId!: string;
  @ApiProperty({ example: 'query' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  term!: string;
  @ApiProperty({ example: 2.5 }) @IsNumber() @Min(1.3) ease!: number;
  @ApiProperty({ example: 6 }) @IsInt() @Min(0) interval!: number;
  @ApiProperty({ example: 2 }) @IsInt() @Min(0) repetitions!: number;
  @ApiProperty({ example: '2026-11-24T09:00:00.000Z' })
  @IsISO8601({ strict: true })
  dueAt!: string;
  @ApiProperty({ example: 0 }) @IsInt() @Min(0) lapses!: number;
  @ApiProperty({
    example: '2026-11-18T09:00:00.000Z',
    description: 'Last write wins',
  })
  @IsISO8601({ strict: true })
  updatedAt!: string;
}

export class ScenarioAnswerDto extends SpokenRecordDto {
  @ApiProperty({ example: 'sql-1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  promptId!: string;
  @ApiProperty({ example: 'sql' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  deckId!: string;
  @ApiProperty({ example: 74, nullable: true, type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  score!: number | null;
}

export class TalkDto extends SpokenRecordDto {}

/** A validated list of at most SYNC_PAGE_SIZE records of one kind. */
const RecordList = (type: () => new () => object) =>
  applyDecorators(
    IsArray(),
    ArrayMaxSize(SYNC_PAGE_SIZE),
    ValidateNested({ each: true }),
    Type(type),
  );

export class SyncBatchDto {
  @ApiProperty({ type: [ShadowingAttemptDto] })
  @RecordList(() => ShadowingAttemptDto)
  shadowingAttempts!: ShadowingAttemptDto[];

  @ApiProperty({ type: [PairAttemptDto] })
  @RecordList(() => PairAttemptDto)
  pairAttempts!: PairAttemptDto[];

  @ApiProperty({ type: [VocabularyStateDto] })
  @RecordList(() => VocabularyStateDto)
  vocabularyStates!: VocabularyStateDto[];

  @ApiProperty({ type: [ScenarioAnswerDto] })
  @RecordList(() => ScenarioAnswerDto)
  scenarioAnswers!: ScenarioAnswerDto[];

  @ApiProperty({ type: [TalkDto] })
  @RecordList(() => TalkDto)
  talks!: TalkDto[];
}

export class SyncUploadResultDto {
  @ApiProperty({
    example: 5,
    description: 'Rows received (duplicates included; they change nothing)',
  })
  received!: number;
}

export class SyncDownloadQueryDto {
  @ApiPropertyOptional({
    example: 's12.p3.v40.a5.t1',
    description: 'The cursor from the last download; empty = everything',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9.]{0,100}$/)
  since?: string;
}

export class SyncChangesDto {
  @ApiProperty({ type: SyncBatchDto }) changes!: SyncBatchDto;
  @ApiProperty({
    example: 's12.p3.v40.a5.t1',
    description: 'Send it back as `since` next time',
  })
  cursor!: string;
  @ApiProperty({
    description: 'More rows are waiting: download again with the new cursor',
  })
  hasMore!: boolean;
}
