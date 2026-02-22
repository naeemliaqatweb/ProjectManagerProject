import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Column } from '@prisma/client';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ColumnUncheckedCreateInput): Promise<Column> {
    return this.prisma.column.create({
      data,
    });
  }

  async findOne(id: string): Promise<Column | null> {
    return this.prisma.column.findUnique({
      where: { id },
    });
  }

  async findAllByProject(projectId: string): Promise<Column[]> {
    return this.prisma.column.findMany({
      where: { projectId },
      include: { tasks: true },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: Prisma.ColumnUpdateInput): Promise<Column> {
    return this.prisma.column.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Column> {
    return this.prisma.column.delete({
      where: { id },
    });
  }
}
