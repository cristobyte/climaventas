import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, SaleStatus } from '../common/constants';

@ApiTags('Ventas')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas' })
  @ApiQuery({ name: 'status', required: false, enum: SaleStatus })
  @ApiQuery({ name: 'agentId', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  findAll(
    @Request() req: any,
    @Query('status') status?: SaleStatus,
    @Query('agentId') agentId?: string,
    @Query('customerId') customerId?: string,
    @Query('productId') productId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.salesService.findAll(
      {
        status,
        agentId,
        customerId,
        productId,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      req.user.role,
      req.user.userId,
    );
  }

  @Get('commissions')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener reporte de comisiones' })
  @ApiQuery({ name: 'agentId', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reporte de comisiones' })
  getCommissions(
    @Request() req: any,
    @Query('agentId') agentId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    // Agents can only see their own commissions
    const effectiveAgentId = req.user.role === Role.AGENT ? req.user.userId : agentId;

    return this.salesService.getCommissions(
      effectiveAgentId,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.salesService.findOne(id, req.user.role, req.user.userId);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({ status: 201, description: 'Venta creada' })
  create(@Body() createSaleDto: CreateSaleDto, @Request() req: any) {
    return this.salesService.create(createSaleDto, req.user.userId);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar una venta' })
  @ApiResponse({ status: 200, description: 'Venta actualizada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @Request() req: any,
  ) {
    return this.salesService.update(id, updateSaleDto, req.user.role, req.user.userId);
  }

  @Patch(':id/approve')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Aprobar una venta' })
  @ApiResponse({ status: 200, description: 'Venta aprobada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  approve(@Param('id') id: string) {
    return this.salesService.approve(id);
  }

  @Patch(':id/complete')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Completar una venta' })
  @ApiResponse({ status: 200, description: 'Venta completada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  complete(@Param('id') id: string) {
    return this.salesService.complete(id);
  }

  @Patch(':id/cancel')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Cancelar una venta' })
  @ApiResponse({ status: 200, description: 'Venta cancelada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  cancel(@Param('id') id: string) {
    return this.salesService.cancel(id);
  }
}
