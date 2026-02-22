import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Task } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(data: Prisma.TaskUncheckedCreateInput): Promise<Task> {
    const { labelIds, dependsOnIds, dependencyForIds, order, ...rest } =
      data as any;
    return this.prisma.task.create({
      data: {
        ...rest,
        labels: labelIds?.length
          ? {
              connect: labelIds.map((id: string) => ({ id })),
            }
          : undefined,
        dependsOn: dependsOnIds?.length
          ? {
              connect: dependsOnIds.map((id: string) => ({ id })),
            }
          : undefined,
        dependencyFor: dependencyForIds?.length
          ? {
              connect: dependencyForIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        column: true,
        labels: true,
        dependsOn: true,
        dependencyFor: true,
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });
  }

  async findAllByColumn(columnId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { columnId },
      include: {
        labels: true,
        dependsOn: true,
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    const oldTask = await this.prisma.task.findUnique({
      where: { id },
    });

    const { dependsOnIds, labelIds, ...updateData } = data as any;

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        dependsOn: dependsOnIds
          ? {
              set: dependsOnIds.map((id: string) => ({ id })),
            }
          : undefined,
        labels: labelIds
          ? {
              set: labelIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        labels: true,
        dependsOn: true,
        assignee: true,
      },
    });

    if (!oldTask) return updatedTask;

    // Trigger notification if assignee changed
    // Use any cast to handle potential field name variations in Prisma input
    const newAssigneeId =
      (data as any).assigneeId || (data.assignee as any)?.connect?.id;
    const oldAssigneeId = oldTask.assigneeId;

    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      const notification = await this.notificationsService.create({
        userId: newAssigneeId,
        message: `You have been assigned to task: ${updatedTask.title}`,
      });
      this.eventsGateway.sendNotification(newAssigneeId, notification);
    }

    return updatedTask;
  }

  async remove(id: string): Promise<Task> {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async addAttachments(id: string, urls: string[]): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    const existingAttachments = task?.attachments || [];

    return this.prisma.task.update({
      where: { id },
      data: {
        attachments: {
          set: [...existingAttachments, ...urls],
        },
      },
    });
  }

  async incrementActualTime(id: string, minutes: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new Error('Task not found');

    const additionalHours = minutes / 60;
    const newActualHours = (task.actualHours || 0) + additionalHours;

    return this.prisma.task.update({
      where: { id },
      data: {
        actualHours: newActualHours,
      },
      include: {
        labels: true,
        dependsOn: true,
        assignee: true,
      },
    });
  }
}
