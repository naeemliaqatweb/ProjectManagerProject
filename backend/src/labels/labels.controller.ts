import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { LabelsService } from './labels.service';
import { Prisma } from '@prisma/client';
import { ActivityInterceptor } from '../common/interceptors/activity.interceptor';

@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post()
  async create(@Body() data: Prisma.LabelUncheckedCreateInput) {
    return this.labelsService.create(data);
  }

  @Get('project/:projectId')
  async findAll(@Param('projectId') projectId: string) {
    return this.labelsService.findAllByProject(projectId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.LabelUpdateInput) {
    return this.labelsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.labelsService.remove(id);
  }
}
