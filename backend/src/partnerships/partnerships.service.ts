import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { UpdatePartnershipDto } from './dto/update-partnership.dto';

@Injectable()
export class PartnershipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { isActive?: boolean; search?: string }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { contactName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    return this.prisma.partnership.findMany({
      where,
      include: {
        _count: {
          select: {
            referrals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: {
        referrals: {
          include: {
            referredCustomer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    if (!partnership) {
      throw new NotFoundException('Alianza no encontrada');
    }

    return partnership;
  }

  async create(createPartnershipDto: CreatePartnershipDto) {
    return this.prisma.partnership.create({
      data: createPartnershipDto,
    });
  }

  async update(id: string, updatePartnershipDto: UpdatePartnershipDto) {
    await this.findOne(id);

    return this.prisma.partnership.update({
      where: { id },
      data: updatePartnershipDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check for referrals
    const referrals = await this.prisma.referral.count({ where: { partnershipId: id } });
    if (referrals > 0) {
      throw new ForbiddenException('No se puede eliminar una alianza con referidos asociados. Desactívela en su lugar.');
    }

    return this.prisma.partnership.delete({ where: { id } });
  }

  async getStats() {
    const partnerships = await this.prisma.partnership.findMany({
      include: {
        _count: {
          select: {
            referrals: true,
          },
        },
        referrals: {
          where: { status: 'CONVERTED' },
        },
      },
    });

    const total = partnerships.length;
    const active = partnerships.filter((p) => p.isActive).length;
    const totalReferrals = partnerships.reduce((sum, p) => sum + p._count.referrals, 0);
    const convertedReferrals = partnerships.reduce((sum, p) => sum + p.referrals.length, 0);

    return {
      total,
      active,
      totalReferrals,
      convertedReferrals,
      conversionRate: totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0,
      topPartners: partnerships
        .sort((a, b) => b._count.referrals - a._count.referrals)
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          name: p.name,
          referrals: p._count.referrals,
          converted: p.referrals.length,
        })),
    };
  }
}
