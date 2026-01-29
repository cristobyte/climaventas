import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  Role,
  CustomerStage,
  CustomerSource,
  ProductCategory,
} from '../common/constants';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if database has data' })
  async status() {
    const userCount = await this.prisma.user.count();
    return { seeded: userCount > 0, userCount };
  }

  @Post('run')
  @ApiOperation({ summary: 'Seed database with demo data' })
  async seed() {
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      return { message: 'Database already seeded', userCount };
    }

    const passwordHash = await bcrypt.hash('Demo2024!', 10);

    // Create users
    const admin = await this.prisma.user.create({
      data: {
        email: 'admin@climatecnologia.cl',
        passwordHash,
        name: 'Administrador',
        phone: '+56912345678',
        role: Role.MANAGEMENT,
        commissionRate: 0,
        isActive: true,
      },
    });

    const analyst = await this.prisma.user.create({
      data: {
        email: 'analista@climatecnologia.cl',
        passwordHash,
        name: 'María Analista',
        phone: '+56987654321',
        role: Role.ANALYTICS,
        commissionRate: 0,
        isActive: true,
      },
    });

    const agent1 = await this.prisma.user.create({
      data: {
        email: 'vendedor@climatecnologia.cl',
        passwordHash,
        name: 'Carlos Vendedor',
        phone: '+56911223344',
        role: Role.AGENT,
        commissionRate: 0.08,
        isActive: true,
      },
    });

    // Create products
    const products = await Promise.all([
      this.prisma.product.create({
        data: {
          name: 'Split 12000 BTU Inverter',
          description: 'Aire acondicionado split inverter de 12000 BTU',
          brand: 'Samsung',
          model: 'AR12TXHQASINPE',
          price: 449990,
          commissionPercentage: 0.08,
          category: ProductCategory.SPLIT,
          isActive: true,
        },
      }),
      this.prisma.product.create({
        data: {
          name: 'Instalación Básica',
          description: 'Instalación estándar incluye hasta 3 metros de cañería',
          price: 89990,
          commissionPercentage: 0.05,
          category: ProductCategory.INSTALLATION,
          isActive: true,
        },
      }),
      this.prisma.product.create({
        data: {
          name: 'Mantención Preventiva',
          description: 'Servicio de mantención preventiva completo',
          price: 49990,
          commissionPercentage: 0.15,
          category: ProductCategory.MAINTENANCE,
          isActive: true,
        },
      }),
    ]);

    // Create customer
    const customer = await this.prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        phone: '+56912345001',
        address: 'Av. Providencia 1234',
        city: 'Santiago',
        region: 'Metropolitana',
        stage: CustomerStage.FIDELITY,
        source: CustomerSource.WEBSITE,
        assignedAgentId: agent1.id,
      },
    });

    return {
      message: 'Database seeded successfully',
      users: 3,
      products: products.length,
      customers: 1,
    };
  }
}
