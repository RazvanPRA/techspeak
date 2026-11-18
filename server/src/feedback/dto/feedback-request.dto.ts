import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PhonemeInputDto {
  @ApiProperty({ example: 'θ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  phoneme!: string;

  @ApiProperty({ example: 35, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy!: number;
}

export class ScoredWordDto {
  @ApiProperty({ example: 'query' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  word!: string;

  @ApiProperty({ example: 55, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy!: number;

  @ApiPropertyOptional({ type: [PhonemeInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => PhonemeInputDto)
  phonemes?: PhonemeInputDto[];
}

export class FeedbackRequestDto {
  @ApiProperty({ example: 'How would you investigate a slow query?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  prompt!: string;

  @ApiProperty({ example: 'sql', description: 'A deck id from VOCABULARY.md' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  deckId!: string;

  @ApiProperty({
    example:
      'First I would run EXPLAIN ANALYZE to see whether the query uses an index.',
  })
  @IsString()
  @MaxLength(10_000)
  transcript!: string;

  @ApiProperty({ example: 75, minimum: 0, maximum: 600 })
  @IsNumber()
  @Min(0)
  @Max(600)
  durationSeconds!: number;

  @ApiPropertyOptional({
    type: [ScoredWordDto],
    description: 'Azure word scores, if available',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => ScoredWordDto)
  pronunciation?: ScoredWordDto[];
}
