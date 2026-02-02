import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleStatus, Role, CustomerStage, LeadStatus } from '../common/constants';

interface FindAllFilters {
  status?: SaleStatus;
  agentId?: string;
  customerId?: string;
  productId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FindAllFilters, userRole?: Role, userId?: string) {
    const where: any = {};

    // Agents can only see their own sales
    if (userRole === Role.AGENT && userId) {
      where.agentId = userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.agentId) {
      where.agentId = filters.agentId;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.saleDate = {};
      if (filters.dateFrom) {
        where.saleDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.saleDate.lte = filters.dateTo;
      }
    }

    return this.prisma.sale.findMany({
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
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            closureChance: true,
          },
        },
      },
      orderBy: { saleDate: 'desc' },
    });
  }

  async findOne(id: string, userRole?: Role, userId?: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            commissionRate: true,
          },
        },
        product: true,
        lead: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    // Agents can only see their own sales
    if (userRole === Role.AGENT && userId && sale.agentId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta venta');
    }

    return sale;
  }

  async create(createSaleDto: CreateSaleDto, userId: string) {
    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: createSaleDto.customerId },
    });
    if (!customer) {
      throw new BadRequestException('Cliente no encontrado');
    }

    // Verify product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: createSaleDto.productId },
    });
    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }
    if (!product.isActive) {
      throw new BadRequestException('El producto no está activo');
    }

    // Get agent's commission rate
    const agent = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!agent) {
      throw new BadRequestException('Agente no encontrado');
    }

    // Calculate amounts
    const quantity = createSaleDto.quantity || 1;
    const unitPrice = createSaleDto.unitPrice || product.price;
    const totalAmount = unitPrice * quantity;

    // Calculate commission using product percentage or agent rate
    const commissionRate = await this.calculateCommissionRate(
      product.id,
      userId,
      totalAmount,
      product.commissionPercentage,
      agent.commissionRate,
    );
    const commissionAmount = totalAmount * commissionRate;

    // If lead is provided, verify it exists
    if (createSaleDto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: createSaleDto.leadId },
      });
      if (!lead) {
        throw new BadRequestException('Lead no encontrado');
      }
    }

    const sale = await this.prisma.sale.create({
      data: {
        customerId: createSaleDto.customerId,
        agentId: userId,
        productId: createSaleDto.productId,
        quantity,
        unitPrice,
        totalAmount,
        commissionAmount,
        status: SaleStatus.PENDING,
        paymentMethod: createSaleDto.paymentMethod,
        notes: createSaleDto.notes,
        saleDate: createSaleDto.saleDate ? new Date(createSaleDto.saleDate) : new Date(),
        leadId: createSaleDto.leadId,
        quotationUrl: createSaleDto.quotationUrl,
      },
      include: {
        customer: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: true,
        lead: true,
      },
    });

    // If sale was created from a lead, update lead status to WON
    if (createSaleDto.leadId) {
      await this.prisma.lead.update({
        where: { id: createSaleDto.leadId },
        data: { status: LeadStatus.WON },
      });
    }

    // Update customer stage if needed
    if (customer.stage === CustomerStage.PROSPECTING || customer.stage === CustomerStage.PRE_SALES) {
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { stage: CustomerStage.SALES },
      });
    }

    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, userRole?: Role, userId?: string) {
    const sale = await this.findOne(id, userRole, userId);

    // Only pending sales can be updated
    if (sale.status !== SaleStatus.PENDING) {
      throw new ForbiddenException('Solo se pueden modificar ventas pendientes');
    }

    const data: any = { ...updateSaleDto };

    // Recalculate totals if quantity or price changed
    if (updateSaleDto.quantity || updateSaleDto.unitPrice) {
      const quantity = updateSaleDto.quantity || sale.quantity;
      const unitPrice = updateSaleDto.unitPrice || sale.unitPrice;
      data.totalAmount = quantity * unitPrice;

      // Recalculate commission
      const commissionRate = await this.calculateCommissionRate(
        sale.productId,
        sale.agentId,
        data.totalAmount,
        sale.product.commissionPercentage,
        sale.agent.commissionRate,
      );
      data.commissionAmount = data.totalAmount * commissionRate;
    }

    return this.prisma.sale.update({
      where: { id },
      data,
      include: {
        customer: true,
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: true,
      },
    });
  }

  async approve(id: string) {
    const sale = await this.findOne(id);

    if (sale.status !== SaleStatus.PENDING) {
      throw new ForbiddenException('Solo se pueden aprobar ventas pendientes');
    }

    const updatedSale = await this.prisma.sale.update({
      where: { id },
      data: { status: SaleStatus.APPROVED },
      include: {
        customer: true,
        agent: true,
        product: true,
      },
    });

    // Update customer stage to POST_PURCHASE
    await this.prisma.customer.update({
      where: { id: sale.customerId },
      data: { stage: CustomerStage.POST_PURCHASE },
    });

    return updatedSale;
  }

  async complete(id: string) {
    const sale = await this.findOne(id);

    if (sale.status !== SaleStatus.APPROVED) {
      throw new ForbiddenException('Solo se pueden completar ventas aprobadas');
    }

    return this.prisma.sale.update({
      where: { id },
      data: { status: SaleStatus.COMPLETED },
      include: {
        customer: true,
        agent: true,
        product: true,
      },
    });
  }

  async cancel(id: string) {
    const sale = await this.findOne(id);

    if (sale.status === SaleStatus.COMPLETED) {
      throw new ForbiddenException('No se pueden cancelar ventas completadas');
    }

    return this.prisma.sale.update({
      where: { id },
      data: { status: SaleStatus.CANCELLED },
      include: {
        customer: true,
        agent: true,
        product: true,
      },
    });
  }

  async getCommissions(userId?: string, dateFrom?: Date, dateTo?: Date) {
    const where: any = {
      status: SaleStatus.COMPLETED,
    };

    if (userId) {
      where.agentId = userId;
    }

    if (dateFrom || dateTo) {
      where.saleDate = {};
      if (dateFrom) {
        where.saleDate.gte = dateFrom;
      }
      if (dateTo) {
        where.saleDate.lte = dateTo;
      }
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true },
        },
        product: {
          select: { id: true, name: true, category: true },
        },
      },
    });

    // Group by agent
    const byAgent = sales.reduce(
      (acc, sale) => {
        const agentId = sale.agentId;
        if (!acc[agentId]) {
          acc[agentId] = {
            agent: sale.agent,
            totalSales: 0,
            totalRevenue: 0,
            totalCommission: 0,
            sales: [],
          };
        }
        acc[agentId].totalSales++;
        acc[agentId].totalRevenue += sale.totalAmount;
        acc[agentId].totalCommission += sale.commissionAmount;
        acc[agentId].sales.push(sale);
        return acc;
      },
      {} as Record<string, any>,
    );

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCommission = sales.reduce((sum, s) => sum + s.commissionAmount, 0);

    return {
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalCommission,
      },
      byAgent: Object.values(byAgent),
    };
  }

  private async calculateCommissionRate(
    productId: string,
    agentId: string,
    saleAmount: number,
    productCommissionRate: number,
    agentCommissionRate: number,
  ): Promise<number> {
    // Check for active commission rules
    const rules = await this.prisma.commissionRule.findMany({
      where: {
        isActive: true,
        OR: [
          { productId },
          { agentId },
          { ruleType: 'VOLUME' },
          { ruleType: 'BONUS' },
        ],
        AND: [
          {
            OR: [{ validFrom: null }, { validFrom: { lte: new Date() } }],
          },
          {
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    // Find the best applicable rule
    let bestRate = productCommissionRate || agentCommissionRate;

    for (const rule of rules) {
      // Check if rule applies
      if (rule.minSaleAmount && saleAmount < rule.minSaleAmount) continue;
      if (rule.maxSaleAmount && saleAmount > rule.maxSaleAmount) continue;

      if (rule.commissionPercentage && rule.commissionPercentage > bestRate) {
        bestRate = rule.commissionPercentage;
      }
    }

    return bestRate;
  }
}
