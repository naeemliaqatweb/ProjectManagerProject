import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Activity } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ActivityUncheckedCreateInput): Promise<Activity> {
    return this.prisma.activity.create({
      data,
    });
  }

  async findAllByProject(projectId: string): Promise<any[]> {
    return this.prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  async findAllByUser(userId: string): Promise<any[]> {
    return this.prisma.activity.findMany({
      where: {
        project: {
          OR: [{ ownerId: userId }, { sharedWithIds: { has: userId } }],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            email: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}
