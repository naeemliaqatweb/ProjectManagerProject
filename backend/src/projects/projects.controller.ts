import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Prisma } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: Prisma.ProjectUncheckedCreateInput) {
    return this.projectsService.create(createProjectDto);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.projectsService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOneWithDetails(id);
  }

  @Get('shared/:userId')
  async findSharedByUser(@Param('userId') userId: string) {
    return this.projectsService.findSharedByUserId(userId);
  }

  @Post(':id/share')
  async shareProject(@Param('id') id: string, @Body('email') email: string) {
    return this.projectsService.shareProject(id, email);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
