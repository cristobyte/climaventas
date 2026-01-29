import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategory } from '../common/constants';

interface FindAllFilters {
  category?: ProductCategory;
  isActive?: boolean;
  search?: string;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FindAllFilters) {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { brand: { contains: filters.search } },
        { model: { contains: filters.search } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        _count: {
          select: {
            sales: true,
          },
        },
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        sales: {
          take: 10,
          orderBy: { saleDate: 'desc' },
          include: {
            customer: {
              select: { id: true, name: true },
            },
            agent: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            sales: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check for related sales
    const sales = await this.prisma.sale.count({ where: { productId: id } });
    if (sales > 0) {
      throw new ForbiddenException('No se puede eliminar un producto con ventas asociadas. Desactívelo en su lugar.');
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async getStats() {
    const categories = await this.prisma.product.groupBy({
      by: ['category'],
      _count: true,
      _avg: {
        price: true,
      },
    });

    const totalProducts = await this.prisma.product.count();
    const activeProducts = await this.prisma.product.count({ where: { isActive: true } });

    const topProducts = await this.prisma.product.findMany({
      include: {
        _count: {
          select: { sales: true },
        },
      },
      orderBy: {
        sales: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalProducts,
      activeProducts,
      byCategory: categories,
      topProducts,
    };
  }
}
