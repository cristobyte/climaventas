import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { InteractionType, Role } from '../common/constants';

interface FindAllFilters {
  customerId?: string;
  userId?: string;
  type?: InteractionType;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FindAllFilters, userRole?: Role, userId?: string) {
    const where: any = {};

    // Agents can only see interactions for their assigned customers
    if (userRole === Role.AGENT && userId) {
      where.customer = {
        assignedAgentId: userId,
      };
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return this.prisma.interaction.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userRole?: Role, userId?: string) {
    const interaction = await this.prisma.interaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            assignedAgentId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!interaction) {
      throw new NotFoundException('Interacción no encontrada');
    }

    // Agents can only see interactions for their assigned customers
    if (userRole === Role.AGENT && userId && interaction.customer.assignedAgentId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta interacción');
    }

    return interaction;
  }

  async create(createInteractionDto: CreateInteractionDto, userId: string, userRole?: Role) {
    // Verify customer exists and agent has access
    const customer = await this.prisma.customer.findUnique({
      where: { id: createInteractionDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Agents can only create interactions for their assigned customers
    if (userRole === Role.AGENT && customer.assignedAgentId !== userId) {
      throw new ForbiddenException('No tienes acceso a este cliente');
    }

    return this.prisma.interaction.create({
      data: {
        customerId: createInteractionDto.customerId,
        userId,
        type: createInteractionDto.type,
        subject: createInteractionDto.subject,
        description: createInteractionDto.description,
        scheduledAt: createInteractionDto.scheduledAt
          ? new Date(createInteractionDto.scheduledAt)
          : undefined,
        completedAt: createInteractionDto.completedAt
          ? new Date(createInteractionDto.completedAt)
          : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, updateInteractionDto: UpdateInteractionDto, userRole?: Role, userId?: string) {
    await this.findOne(id, userRole, userId);

    const data: any = { ...updateInteractionDto };

    if (updateInteractionDto.scheduledAt) {
      data.scheduledAt = new Date(updateInteractionDto.scheduledAt);
    }

    if (updateInteractionDto.completedAt) {
      data.completedAt = new Date(updateInteractionDto.completedAt);
    }

    return this.prisma.interaction.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userRole?: Role, userId?: string) {
    await this.findOne(id, userRole, userId);

    return this.prisma.interaction.delete({ where: { id } });
  }

  async getStats(dateFrom?: Date, dateTo?: Date) {
    const where: any = {};

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = dateFrom;
      }
      if (dateTo) {
        where.createdAt.lte = dateTo;
      }
    }

    const byType = await this.prisma.interaction.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    const total = await this.prisma.interaction.count({ where });

    return {
      total,
      byType: byType.reduce(
        (acc, t) => ({ ...acc, [t.type]: t._count }),
        {} as Record<string, number>,
      ),
    };
  }
}
