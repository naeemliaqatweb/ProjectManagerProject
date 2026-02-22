import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-task')
  async generateTask(@Body() body: { text: string; projectId: string }) {
    if (!body.text || !body.projectId) {
      throw new HttpException(
        'Text and Project ID are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.aiService.generateTask(body.text, body.projectId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to generate task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
