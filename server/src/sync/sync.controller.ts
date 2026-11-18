import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import {
  SyncBatchDto,
  SyncChangesDto,
  SyncDownloadQueryDto,
  SyncUploadResultDto,
} from './dto/sync.dto.js';
import { SyncService } from './sync.service.js';

@ApiSecurity('api-key')
@Controller('sync')
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Upload progress from the app. Idempotent: rows with a known id are skipped; ' +
      'vocabulary states replace older ones (last write wins by updatedAt).',
  })
  @ApiOkResponse({ type: SyncUploadResultDto })
  upload(@Body() batch: SyncBatchDto): Promise<SyncUploadResultDto> {
    return this.sync.upload(batch);
  }

  @Get()
  @ApiOperation({
    summary:
      'Download rows stored after `since` (a fresh install sends no cursor and gets everything).',
  })
  @ApiOkResponse({ type: SyncChangesDto })
  download(@Query() query: SyncDownloadQueryDto): Promise<SyncChangesDto> {
    return this.sync.download(query.since);
  }
}
