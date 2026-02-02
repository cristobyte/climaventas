import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadStatus } from '../common/constants';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    status?: string;
    customerId?: string;
    agentId?: string;
    minClosureChance?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.agentId) {
      where.agentId = filters.agentId;
    }

    if (filters?.minClosureChance !== undefined) {
      where.closureChance = { gte: filters.minClosureChance };
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sales: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead no encontrado');
    }

    return lead;
  }

  async create(createLeadDto: CreateLeadDto, agentId: string) {
    return this.prisma.lead.create({
      data: {
        customerId: createLeadDto.customerId,
        agentId,
        title: createLeadDto.title,
        description: createLeadDto.description,
        closureChance: createLeadDto.closureChance || 50,
        estimatedValue: createLeadDto.estimatedValue,
        status: createLeadDto.status || LeadStatus.NEW,
        notes: createLeadDto.notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const lead = await this.findOne(id);

    // Check if lead has associated sales
    const salesCount = await this.prisma.sale.count({
      where: { leadId: id },
    });

    if (salesCount > 0) {
      throw new NotFoundException('No se puede eliminar un lead con ventas asociadas');
    }

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, byStatus, avgClosureChance, totalEstimatedValue] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.lead.aggregate({
        _avg: { closureChance: true },
      }),
      this.prisma.lead.aggregate({
        where: { status: { notIn: ['WON', 'LOST'] } },
        _sum: { estimatedValue: true },
      }),
    ]);

    const statusCounts = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus: statusCounts,
      avgClosureChance: avgClosureChance._avg.closureChance || 0,
      totalEstimatedValue: totalEstimatedValue._sum.estimatedValue || 0,
    };
  }

  async convertToSale(id: string) {
    const lead = await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: { status: LeadStatus.WON },
    });
  }

  async markAsLost(id: string) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: { status: LeadStatus.LOST },
    });
  }
}
