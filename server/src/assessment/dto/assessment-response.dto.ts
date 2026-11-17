import { ApiProperty } from '@nestjs/swagger';
import { ERROR_TYPES, type WordErrorType } from '../assessment.types.js';

// Swagger shapes of PronunciationResult (assessment.types.ts).

export class PhonemeScoreDto {
  @ApiProperty({ example: 'θ' }) phoneme!: string;
  @ApiProperty({ example: 42, minimum: 0, maximum: 100 }) accuracy!: number;
}

export class WordScoreDto {
  @ApiProperty({ example: 'think' }) word!: string;
  @ApiProperty({ example: 58, minimum: 0, maximum: 100 }) accuracy!: number;
  @ApiProperty({ enum: ERROR_TYPES, example: 'Mispronunciation' })
  errorType!: WordErrorType;
  @ApiProperty({ type: [PhonemeScoreDto] }) phonemes!: PhonemeScoreDto[];
}

export class PronunciationScoresDto {
  @ApiProperty({ example: 82.5 }) pronunciation!: number;
  @ApiProperty({ example: 80 }) accuracy!: number;
  @ApiProperty({ example: 90 }) fluency!: number;
  @ApiProperty({ example: 100 }) completeness!: number;
  @ApiProperty({ example: 76, nullable: true, type: Number }) prosody!:
    number | null;
}

export class AssessmentResponseDto {
  @ApiProperty({ description: 'false when Azure heard no speech' })
  recognized!: boolean;
  @ApiProperty({ example: 'Think about the cache.' }) transcript!: string;
  @ApiProperty({ type: PronunciationScoresDto })
  scores!: PronunciationScoresDto;
  @ApiProperty({
    type: [WordScoreDto],
    description: 'Reference words in order, plus insertions',
  })
  words!: WordScoreDto[];
}
