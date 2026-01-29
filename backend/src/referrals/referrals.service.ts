import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { ReferralStatus } from '../common/constants';

interface FindAllFilters {
  status?: ReferralStatus;
  partnershipId?: string;
  referrerCustomerId?: string;
}

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FindAllFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.partnershipId) {
      where.partnershipId = filters.partnershipId;
    }

    if (filters?.referrerCustomerId) {
      where.referrerCustomerId = filters.referrerCustomerId;
    }

    return this.prisma.referral.findMany({
      where,
      include: {
        referrerCustomer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        referredCustomer: {
          select: {
            id: true,
            name: true,
            email: true,
            stage: true,
          },
        },
        partnership: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      include: {
        referrerCustomer: true,
        referredCustomer: true,
        partnership: true,
      },
    });

    if (!referral) {
      throw new NotFoundException('Referido no encontrado');
    }

    return referral;
  }

  async create(createReferralDto: CreateReferralDto) {
    // Verify referred customer exists
    const referredCustomer = await this.prisma.customer.findUnique({
      where: { id: createReferralDto.referredCustomerId },
    });
    if (!referredCustomer) {
      throw new BadRequestException('Cliente referido no encontrado');
    }

    // Verify referrer customer if provided
    if (createReferralDto.referrerCustomerId) {
      const referrerCustomer = await this.prisma.customer.findUnique({
        where: { id: createReferralDto.referrerCustomerId },
      });
      if (!referrerCustomer) {
        throw new BadRequestException('Cliente referidor no encontrado');
      }
    }

    // Verify partnership if provided
    if (createReferralDto.partnershipId) {
      const partnership = await this.prisma.partnership.findUnique({
        where: { id: createReferralDto.partnershipId },
      });
      if (!partnership) {
        throw new BadRequestException('Alianza no encontrada');
      }
    }

    // Check if referral already exists
    const existingReferral = await this.prisma.referral.findFirst({
      where: {
        referredCustomerId: createReferralDto.referredCustomerId,
        status: { not: ReferralStatus.EXPIRED },
      },
    });
    if (existingReferral) {
      throw new BadRequestException('Ya existe un referido activo para este cliente');
    }

    return this.prisma.referral.create({
      data: {
        referrerCustomerId: createReferralDto.referrerCustomerId,
        referredCustomerId: createReferralDto.referredCustomerId,
        partnershipId: createReferralDto.partnershipId,
        bonusAmount: createReferralDto.bonusAmount,
      },
      include: {
        referrerCustomer: {
          select: { id: true, name: true },
        },
        referredCustomer: {
          select: { id: true, name: true },
        },
        partnership: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, updateReferralDto: UpdateReferralDto) {
    await this.findOne(id);

    return this.prisma.referral.update({
      where: { id },
      data: updateReferralDto,
      include: {
        referrerCustomer: {
          select: { id: true, name: true },
        },
        referredCustomer: {
          select: { id: true, name: true },
        },
        partnership: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async convert(id: string, bonusAmount?: number) {
    const referral = await this.findOne(id);

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Solo se pueden convertir referidos pendientes');
    }

    return this.prisma.referral.update({
      where: { id },
      data: {
        status: ReferralStatus.CONVERTED,
        bonusAmount: bonusAmount || referral.bonusAmount,
      },
      include: {
        referrerCustomer: true,
        referredCustomer: true,
        partnership: true,
      },
    });
  }

  async expire(id: string) {
    const referral = await this.findOne(id);

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Solo se pueden expirar referidos pendientes');
    }

    return this.prisma.referral.update({
      where: { id },
      data: { status: ReferralStatus.EXPIRED },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.referral.delete({ where: { id } });
  }

  async getStats() {
    const referrals = await this.prisma.referral.findMany({
      include: {
        partnership: true,
      },
    });

    const total = referrals.length;
    const pending = referrals.filter((r) => r.status === ReferralStatus.PENDING).length;
    const converted = referrals.filter((r) => r.status === ReferralStatus.CONVERTED).length;
    const expired = referrals.filter((r) => r.status === ReferralStatus.EXPIRED).length;
    const totalBonus = referrals
      .filter((r) => r.status === ReferralStatus.CONVERTED && r.bonusAmount)
      .reduce((sum, r) => sum + (r.bonusAmount || 0), 0);

    // Group by source (partnership vs customer)
    const fromPartnerships = referrals.filter((r) => r.partnershipId).length;
    const fromCustomers = referrals.filter((r) => r.referrerCustomerId && !r.partnershipId).length;

    return {
      total,
      pending,
      converted,
      expired,
      totalBonus,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
      bySource: {
        partnerships: fromPartnerships,
        customers: fromCustomers,
      },
    };
  }
}
