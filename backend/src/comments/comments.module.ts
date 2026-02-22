import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsGateway } from './comments.gateway';
import { ActivityModule } from '../activity/activity.module';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ActivityModule, AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService, PrismaService, CommentsGateway],
  exports: [CommentsService],
})
export class CommentsModule {}
