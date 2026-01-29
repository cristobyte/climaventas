import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/constants';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { role?: Role; isActive?: boolean }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedCustomers: true,
            sales: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedCustomers: true,
            sales: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        name: createUserDto.name,
        phone: createUserDto.phone,
        role: createUserDto.role || Role.AGENT,
        commissionRate: createUserDto.commissionRate || 0.05,
        isActive: createUserDto.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete by deactivating
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getPerformance(id: string, dateFrom?: Date, dateTo?: Date) {
    const user = await this.findOne(id);

    const dateFilter: any = {};
    if (dateFrom) {
      dateFilter.gte = dateFrom;
    }
    if (dateTo) {
      dateFilter.lte = dateTo;
    }

    const salesWhere: any = { agentId: id };
    if (Object.keys(dateFilter).length > 0) {
      salesWhere.saleDate = dateFilter;
    }

    const sales = await this.prisma.sale.findMany({
      where: salesWhere,
      include: {
        product: true,
        customer: true,
      },
    });

    const totalSales = sales.length;
    const completedSales = sales.filter((s) => s.status === 'COMPLETED').length;
    const pendingSales = sales.filter((s) => s.status === 'PENDING').length;
    const totalRevenue = sales
      .filter((s) => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCommission = sales
      .filter((s) => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + s.commissionAmount, 0);
    const averageTicket = completedSales > 0 ? totalRevenue / completedSales : 0;

    const assignedCustomers = await this.prisma.customer.count({
      where: { assignedAgentId: id },
    });

    const interactions = await this.prisma.interaction.count({
      where: {
        userId: id,
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
    });

    return {
      user,
      performance: {
        totalSales,
        completedSales,
        pendingSales,
        totalRevenue,
        totalCommission,
        averageTicket,
        assignedCustomers,
        interactions,
        conversionRate: totalSales > 0 ? (completedSales / totalSales) * 100 : 0,
      },
    };
  }
}
