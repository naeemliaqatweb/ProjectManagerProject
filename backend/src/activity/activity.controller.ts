import { Controller, Get, Param } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('project/:projectId')
  async findAllByProject(@Param('projectId') projectId: string) {
    return this.activityService.findAllByProject(projectId);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: string) {
    return this.activityService.findAllByUser(userId);
  }
}
