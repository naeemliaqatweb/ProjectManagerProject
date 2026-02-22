import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Label } from '@prisma/client';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.LabelUncheckedCreateInput): Promise<Label> {
    return this.prisma.label.create({
      data,
    });
  }

  async findAllByProject(projectId: string): Promise<Label[]> {
    return this.prisma.label.findMany({
      where: { projectId },
    });
  }

  async update(id: string, data: Prisma.LabelUpdateInput): Promise<Label> {
    return this.prisma.label.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Label> {
    return this.prisma.label.delete({
      where: { id },
    });
  }
}
