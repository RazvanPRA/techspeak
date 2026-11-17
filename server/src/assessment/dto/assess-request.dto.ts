import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** The text fields of the multipart form; the `audio` file is read by FileInterceptor. */
export class AssessRequestDto {
  @ApiProperty({
    example: 'Reconciliation compares the new tree with the previous one.',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  referenceText!: string;
}

/** Swagger schema of the whole multipart body (file + fields). */
export const ASSESS_REQUEST_SCHEMA = {
  type: 'object',
  required: ['audio', 'referenceText'],
  properties: {
    audio: {
      type: 'string',
      format: 'binary',
      description:
        'WAV (16 kHz mono preferred) or any audio ffmpeg can read, up to 60 s',
    },
    referenceText: {
      type: 'string',
      maxLength: 500,
      example: 'Reconciliation compares the new tree with the previous one.',
    },
  },
};
