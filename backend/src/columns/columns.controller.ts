import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { Prisma } from '@prisma/client';

@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  async create(@Body() createColumnDto: Prisma.ColumnUncheckedCreateInput) {
    return this.columnsService.create(createColumnDto);
  }

  @Get('project/:projectId')
  async findAll(@Param('projectId') projectId: string) {
    return this.columnsService.findAllByProject(projectId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateColumnDto: Prisma.ColumnUpdateInput,
  ) {
    return this.columnsService.update(id, updateColumnDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.columnsService.remove(id);
  }
}
