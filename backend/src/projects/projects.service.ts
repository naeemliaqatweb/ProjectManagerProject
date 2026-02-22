import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProjectUncheckedCreateInput): Promise<Project> {
    return this.prisma.project.create({
      data,
    });
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId: userId },
      include: {
        columns: {
          select: {
            id: true,
            title: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    console.log(
      `findAllByUserId(${userId}) found ${projects.length} projects. First one has columns:`,
      projects[0]?.columns?.length ?? 'none',
    );
    return projects;
  }

  async findOneWithDetails(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        sharedWith: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { createdAt: 'asc' },
              include: {
                labels: true,
                dependsOn: true,
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findSharedByUserId(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: {
        sharedWithIds: {
          has: userId,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async shareProject(projectId: string, email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        sharedWithIds: {
          push: user.id,
        },
        sharedWith: {
          connect: { id: user.id },
        },
      },
    });
  }

  async remove(id: string) {
    // 1. Delete all activities associated with the project
    await this.prisma.activity.deleteMany({
      where: { projectId: id },
    });

    // 2. Delete all labels associated with the project
    await this.prisma.label.deleteMany({
      where: { projectId: id },
    });

    // 3. Find all columns of the project to delete their tasks
    const columns = await this.prisma.column.findMany({
      where: { projectId: id },
      select: { id: true },
    });

    const columnIds = columns.map((col) => col.id);

    // 4. Delete all tasks in those columns
    if (columnIds.length > 0) {
      await this.prisma.task.deleteMany({
        where: { columnId: { in: columnIds } },
      });
    }

    // 5. Delete all columns
    await this.prisma.column.deleteMany({
      where: { projectId: id },
    });

    // 6. Finally delete the project
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
