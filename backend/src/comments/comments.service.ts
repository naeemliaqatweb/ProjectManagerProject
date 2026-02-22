import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsGateway } from './comments.gateway';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private commentsGateway: CommentsGateway,
    private activityService: ActivityService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto) {
    const { taskId, text, parentId } = createCommentDto;

    const comment = await this.prisma.comment.create({
      data: {
        text,
        taskId,
        userId,
        parentId: parentId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Emit real-time event to updated clients
    this.commentsGateway.server
      .to(`task-${taskId}`)
      .emit('commentCreated', comment);

    // Log activity
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true },
    });
    if (task) {
      await this.activityService.create({
        userId,
        projectId: task.column.projectId,
        action: 'COMMENT_ADDED',
        details: `Added a comment to task "${task.title}"`,
      });
    }

    return comment;
  }

  async findAllByTask(taskId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Newest first for top level? Or oldest? Threads usually oldest first. Let's do asc.
    });

    return this.buildCommentTree(comments);
  }

  private buildCommentTree(comments: any[]) {
    const commentMap = new Map();
    const roots: any[] = [];

    // First pass: Initialize map and add replies array
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: Link children to parents
    comments.forEach((originalComment) => {
      const comment = commentMap.get(originalComment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          // Parent might be deleted or not fetched (if pagination existed, but we fetch all)
          // Let's treat as root to not lose data.
          roots.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    // Sort replies by createdAt asc
    const sortReplies = (comment: any) => {
      if (comment.replies?.length) {
        comment.replies.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        comment.replies.forEach(sortReplies);
      }
    };

    roots.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ); // Newest roots first
    roots.forEach(sortReplies);

    return roots;
  }
}
