import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TasksService } from './tasks.service';
import { Prisma } from '@prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(@Body() createTaskDto: Prisma.TaskUncheckedCreateInput) {
    return this.tasksService.create(createTaskDto);
  }

  @Get('column/:columnId')
  async findAll(@Param('columnId') columnId: string) {
    return this.tasksService.findAllByColumn(columnId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: Prisma.TaskUpdateInput,
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadAttachments(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const attachmentUrls = files.map((file) => `/uploads/${file.filename}`);
    return this.tasksService.addAttachments(id, attachmentUrls);
  }
}
