import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SaleStatus, CustomerStage } from '../common/constants';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(dateFrom?: Date, dateTo?: Date) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // Revenue
    const completedSales = await this.prisma.sale.findMany({
      where: {
        status: SaleStatus.COMPLETED,
        ...(hasDateFilter ? { saleDate: dateFilter } : {}),
      },
    });

    const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCommissions = completedSales.reduce((sum, s) => sum + s.commissionAmount, 0);
    const salesCount = completedSales.length;
    const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

    // Customers
    const customersTotal = await this.prisma.customer.count();
    const customersByStage = await this.prisma.customer.groupBy({
      by: ['stage'],
      _count: true,
    });

    // Sales status breakdown
    const salesByStatus = await this.prisma.sale.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        totalAmount: true,
      },
      ...(hasDateFilter ? { where: { saleDate: dateFilter } } : {}),
    });

    // Recent sales
    const recentSales = await this.prisma.sale.findMany({
      where: hasDateFilter ? { saleDate: dateFilter } : {},
      take: 5,
      orderBy: { saleDate: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        agent: { select: { id: true, name: true } },
      },
    });

    // Top products
    const topProducts = await this.prisma.sale.groupBy({
      by: ['productId'],
      where: {
        status: SaleStatus.COMPLETED,
        ...(hasDateFilter ? { saleDate: dateFilter } : {}),
      },
      _count: true,
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (p) => {
        const product = await this.prisma.product.findUnique({
          where: { id: p.productId },
          select: { id: true, name: true, category: true },
        });
        return {
          product,
          salesCount: p._count,
          revenue: p._sum.totalAmount || 0,
        };
      }),
    );

    // Top agents
    const topAgents = await this.prisma.sale.groupBy({
      by: ['agentId'],
      where: {
        status: SaleStatus.COMPLETED,
        ...(hasDateFilter ? { saleDate: dateFilter } : {}),
      },
      _count: true,
      _sum: {
        totalAmount: true,
        commissionAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: 'desc',
        },
      },
      take: 5,
    });

    const topAgentsWithDetails = await Promise.all(
      topAgents.map(async (a) => {
        const agent = await this.prisma.user.findUnique({
          where: { id: a.agentId },
          select: { id: true, name: true, email: true },
        });
        return {
          agent,
          salesCount: a._count,
          revenue: a._sum.totalAmount || 0,
          commissions: a._sum.commissionAmount || 0,
        };
      }),
    );

    return {
      summary: {
        totalRevenue,
        totalCommissions,
        salesCount,
        averageTicket,
        customersTotal,
      },
      customersByStage: customersByStage.reduce(
        (acc, s) => ({ ...acc, [s.stage]: s._count }),
        {} as Record<string, number>,
      ),
      salesByStatus: salesByStatus.reduce(
        (acc, s) => ({
          ...acc,
          [s.status]: { count: s._count, total: s._sum.totalAmount || 0 },
        }),
        {} as Record<string, { count: number; total: number }>,
      ),
      recentSales,
      topProducts: topProductsWithDetails,
      topAgents: topAgentsWithDetails,
    };
  }

  async getSalesFunnel() {
    const stages = Object.values(CustomerStage);
    const funnel: { stage: string; count: number; percentage: number }[] = [];

    const total = await this.prisma.customer.count();

    for (const stage of stages) {
      const count = await this.prisma.customer.count({ where: { stage } });
      funnel.push({
        stage,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      });
    }

    // Calculate conversion rates between stages
    const conversions = [];
    for (let i = 0; i < funnel.length - 1; i++) {
      const current = funnel[i];
      const next = funnel[i + 1];
      conversions.push({
        from: current.stage,
        to: next.stage,
        rate: current.count > 0 ? (next.count / current.count) * 100 : 0,
      });
    }

    return {
      funnel,
      conversions,
      total,
    };
  }

  async getAgentPerformance(dateFrom?: Date, dateTo?: Date) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const agents = await this.prisma.user.findMany({
      where: { role: 'AGENT', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        commissionRate: true,
      },
    });

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const salesWhere: any = {
          agentId: agent.id,
          ...(hasDateFilter ? { saleDate: dateFilter } : {}),
        };

        const sales = await this.prisma.sale.findMany({
          where: salesWhere,
        });

        const completedSales = sales.filter((s) => s.status === SaleStatus.COMPLETED);
        const pendingSales = sales.filter((s) => s.status === SaleStatus.PENDING);

        const totalRevenue = completedSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalCommission = completedSales.reduce((sum, s) => sum + s.commissionAmount, 0);

        const assignedCustomers = await this.prisma.customer.count({
          where: { assignedAgentId: agent.id },
        });

        const interactions = await this.prisma.interaction.count({
          where: {
            userId: agent.id,
            ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          },
        });

        return {
          agent,
          metrics: {
            totalSales: sales.length,
            completedSales: completedSales.length,
            pendingSales: pendingSales.length,
            totalRevenue,
            totalCommission,
            averageTicket: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
            conversionRate:
              sales.length > 0 ? (completedSales.length / sales.length) * 100 : 0,
            assignedCustomers,
            interactions,
          },
        };
      }),
    );

    // Sort by revenue
    performance.sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue);

    return {
      agents: performance,
      summary: {
        totalAgents: agents.length,
        totalRevenue: performance.reduce((sum, p) => sum + p.metrics.totalRevenue, 0),
        totalCommissions: performance.reduce((sum, p) => sum + p.metrics.totalCommission, 0),
        averageConversionRate:
          performance.length > 0
            ? performance.reduce((sum, p) => sum + p.metrics.conversionRate, 0) / performance.length
            : 0,
      },
    };
  }

  async getCommissionReport(dateFrom?: Date, dateTo?: Date, agentId?: string) {
    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = dateFrom;
    if (dateTo) dateFilter.lte = dateTo;

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    const where: any = {
      status: SaleStatus.COMPLETED,
      ...(hasDateFilter ? { saleDate: dateFilter } : {}),
      ...(agentId ? { agentId } : {}),
    };

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, category: true, commissionPercentage: true } },
        customer: { select: { id: true, name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    // Group by agent
    const byAgent = sales.reduce(
      (acc, sale) => {
        const agentId = sale.agentId;
        if (!acc[agentId]) {
          acc[agentId] = {
            agent: sale.agent,
            sales: [],
            totalRevenue: 0,
            totalCommission: 0,
          };
        }
        acc[agentId].sales.push(sale);
        acc[agentId].totalRevenue += sale.totalAmount;
        acc[agentId].totalCommission += sale.commissionAmount;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Group by product category
    const byCategory = sales.reduce(
      (acc, sale) => {
        const category = sale.product.category;
        if (!acc[category]) {
          acc[category] = {
            category,
            salesCount: 0,
            totalRevenue: 0,
            totalCommission: 0,
          };
        }
        acc[category].salesCount++;
        acc[category].totalRevenue += sale.totalAmount;
        acc[category].totalCommission += sale.commissionAmount;
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
        averageCommissionRate: totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0,
      },
      byAgent: Object.values(byAgent),
      byCategory: Object.values(byCategory),
      details: sales,
    };
  }

  async getCustomerRetention() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // New customers in last 30 days
    const newCustomers30d = await this.prisma.customer.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Customers with repeat purchases
    const repeatBuyers = await this.prisma.customer.count({
      where: {
        sales: {
          some: {
            status: SaleStatus.COMPLETED,
          },
        },
        AND: {
          sales: {
            some: {
              status: SaleStatus.COMPLETED,
              saleDate: { lt: thirtyDaysAgo },
            },
          },
        },
      },
    });

    // Customers in fidelity stage
    const fidelityCustomers = await this.prisma.customer.count({
      where: { stage: CustomerStage.FIDELITY },
    });

    // Activity in last 30 days
    const activeCustomers30d = await this.prisma.customer.count({
      where: {
        OR: [
          { interactions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          { sales: { some: { saleDate: { gte: thirtyDaysAgo } } } },
        ],
      },
    });

    const totalCustomers = await this.prisma.customer.count();

    return {
      newCustomers: {
        last30Days: newCustomers30d,
      },
      retention: {
        repeatBuyers,
        fidelityCustomers,
        activeCustomers30d,
        retentionRate: totalCustomers > 0 ? (activeCustomers30d / totalCustomers) * 100 : 0,
      },
      total: totalCustomers,
    };
  }

  async getRevenueForecast() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get monthly revenue for the last 6 months
    const monthlyRevenue = [];

    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, currentMonth - i, 1);
      const nextMonth = new Date(currentYear, currentMonth - i + 1, 1);

      const revenue = await this.prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          saleDate: {
            gte: month,
            lt: nextMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: true,
      });

      monthlyRevenue.push({
        month: month.toISOString().slice(0, 7),
        revenue: revenue._sum.totalAmount || 0,
        salesCount: revenue._count,
      });
    }

    // Simple linear forecast for next 3 months
    const revenueValues = monthlyRevenue.map((m) => m.revenue);
    const avgGrowth =
      revenueValues.length > 1
        ? revenueValues.slice(1).reduce((sum, v, i) => {
            const prev = revenueValues[i];
            return sum + (prev > 0 ? (v - prev) / prev : 0);
          }, 0) / (revenueValues.length - 1)
        : 0;

    const lastRevenue = revenueValues[revenueValues.length - 1] || 0;
    const forecast = [];

    for (let i = 1; i <= 3; i++) {
      const forecastMonth = new Date(currentYear, currentMonth + i, 1);
      forecast.push({
        month: forecastMonth.toISOString().slice(0, 7),
        projectedRevenue: Math.round(lastRevenue * Math.pow(1 + avgGrowth, i)),
      });
    }

    return {
      historical: monthlyRevenue,
      forecast,
      growthRate: avgGrowth * 100,
    };
  }
}
