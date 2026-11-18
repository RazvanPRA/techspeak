import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { FeedbackRequestDto } from './dto/feedback-request.dto.js';
import { ScenarioFeedbackDto } from './dto/feedback-response.dto.js';
import { FeedbackService } from './feedback.service.js';

@ApiSecurity('api-key')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Feedback on a spoken scenario answer (fluency, vocabulary, pronunciation)',
  })
  @ApiOkResponse({ type: ScenarioFeedbackDto })
  review(@Body() body: FeedbackRequestDto): Promise<ScenarioFeedbackDto> {
    return this.feedback.review(body);
  }
}
