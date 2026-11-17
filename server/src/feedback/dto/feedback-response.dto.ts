import { ApiProperty } from '@nestjs/swagger';
import { CORRECTION_TYPES } from '../feedback.schema.js';

// Swagger shapes of ScenarioFeedback (feedback.schema.ts, the zod source of truth).

export class CorrectionDto {
  @ApiProperty() said!: string;
  @ApiProperty() better!: string;
  @ApiProperty({ enum: CORRECTION_TYPES })
  type!: (typeof CORRECTION_TYPES)[number];
  @ApiProperty() why!: string;
}

export class PronunciationTipDto {
  @ApiProperty({ example: 'query' }) word!: string;
  @ApiProperty({ example: '/ˈkwɪəri/' }) ipa!: string;
  @ApiProperty({ example: '"KWEER-ee"' }) tip!: string;
}

export class FluencyDto {
  @ApiProperty({ example: 128 }) wordsPerMinute!: number;
  @ApiProperty({ example: 3 }) fillerCount!: number;
  @ApiProperty({ example: ['um', 'basically'] }) fillers!: string[];
  @ApiProperty() tip!: string;
}

export class VocabularyDto {
  @ApiProperty({ example: ['query', 'index'] }) used!: string[];
  @ApiProperty({ example: ['transaction'] }) missing!: string[];
}

export class ScenarioFeedbackDto {
  @ApiProperty({ minimum: 0, maximum: 100, example: 72 }) overallScore!: number;
  @ApiProperty() strength!: string;
  @ApiProperty({
    type: [CorrectionDto],
    description: 'Empty until an LLM provider is enabled',
  })
  corrections!: CorrectionDto[];
  @ApiProperty({ type: [PronunciationTipDto] })
  pronunciation!: PronunciationTipDto[];
  @ApiProperty({ type: FluencyDto }) fluency!: FluencyDto;
  @ApiProperty({ description: 'Empty until an LLM provider is enabled' })
  improvedAnswer!: string;
  @ApiProperty({ type: [String], maxItems: 3 }) phrasesToReuse!: string[];
  @ApiProperty({ type: VocabularyDto }) vocabulary!: VocabularyDto;
}
