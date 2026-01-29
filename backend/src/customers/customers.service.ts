import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerStage, CustomerSource, Role } from '../common/constants';

interface FindAllFilters {
  stage?: CustomerStage;
  source?: CustomerSource;
  assignedAgentId?: string;
  search?: string;
}

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FindAllFilters, userRole?: Role, userId?: string) {
    const where: any = {};

    // Agents can only see their assigned customers
    if (userRole === Role.AGENT && userId) {
      where.assignedAgentId = userId;
    }

    if (filters?.stage) {
      where.stage = filters.stage;
    }

    if (filters?.source) {
      where.source = filters.source;
    }

    if (filters?.assignedAgentId) {
      where.assignedAgentId = filters.assignedAgentId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
      ];
    }

    return this.prisma.customer.findMany({
      where,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sales: true,
            interactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userRole?: Role, userId?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        sales: {
          include: {
            product: true,
          },
          orderBy: { saleDate: 'desc' },
        },
        interactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            sales: true,
            interactions: true,
            referralsGiven: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Agents can only see their assigned customers
    if (userRole === Role.AGENT && userId && customer.assignedAgentId !== userId) {
      throw new ForbiddenException('No tienes acceso a este cliente');
    }

    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createCustomerDto,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userRole?: Role, userId?: string) {
    const customer = await this.findOne(id, userRole, userId);

    // Agents can only update their assigned customers
    if (userRole === Role.AGENT && userId && customer.assignedAgentId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar este cliente');
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateStage(id: string, stage: CustomerStage, userRole?: Role, userId?: string) {
    const customer = await this.findOne(id, userRole, userId);

    // Agents can only update their assigned customers
    if (userRole === Role.AGENT && userId && customer.assignedAgentId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar este cliente');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { stage },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check for related records
    const sales = await this.prisma.sale.count({ where: { customerId: id } });
    if (sales > 0) {
      throw new ForbiddenException('No se puede eliminar un cliente con ventas asociadas');
    }

    return this.prisma.customer.delete({ where: { id } });
  }

  async getTimeline(id: string, userRole?: Role, userId?: string) {
    const customer = await this.findOne(id, userRole, userId);

    // Get all activities related to the customer
    const interactions = await this.prisma.interaction.findMany({
      where: { customerId: id },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sales = await this.prisma.sale.findMany({
      where: { customerId: id },
      include: {
        product: { select: { name: true } },
        agent: { select: { id: true, name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    // Combine and sort by date
    const timeline = [
      ...interactions.map((i) => ({
        type: 'interaction' as const,
        date: i.createdAt,
        data: i,
      })),
      ...sales.map((s) => ({
        type: 'sale' as const,
        date: s.saleDate,
        data: s,
      })),
      {
        type: 'created' as const,
        date: customer.createdAt,
        data: { message: 'Cliente creado' },
      },
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        stage: customer.stage,
      },
      timeline,
    };
  }

  async getStats() {
    const stages = await this.prisma.customer.groupBy({
      by: ['stage'],
      _count: true,
    });

    const sources = await this.prisma.customer.groupBy({
      by: ['source'],
      _count: true,
    });

    const total = await this.prisma.customer.count();

    return {
      total,
      byStage: stages.reduce(
        (acc, s) => ({ ...acc, [s.stage]: s._count }),
        {} as Record<string, number>,
      ),
      bySource: sources.reduce(
        (acc, s) => ({ ...acc, [s.source]: s._count }),
        {} as Record<string, number>,
      ),
    };
  }
}
