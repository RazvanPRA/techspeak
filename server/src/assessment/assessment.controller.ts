import {
  Body,
  Controller,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from '@nestjs/swagger';
import { AssessmentService } from './assessment.service.js';
import {
  ASSESS_REQUEST_SCHEMA,
  AssessRequestDto,
} from './dto/assess-request.dto.js';
import { AssessmentResponseDto } from './dto/assessment-response.dto.js';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

@ApiSecurity('api-key')
@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessment: AssessmentService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Score pronunciation of a recording against its reference text (Azure)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: ASSESS_REQUEST_SCHEMA })
  @ApiOkResponse({ type: AssessmentResponseDto })
  @UseInterceptors(
    FileInterceptor('audio', { limits: { fileSize: MAX_AUDIO_BYTES } }),
  )
  assess(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_AUDIO_BYTES })],
      }),
    )
    audio: Express.Multer.File,
    @Body() body: AssessRequestDto,
  ): Promise<AssessmentResponseDto> {
    return this.assessment.assess(audio.buffer, body.referenceText);
  }
}
