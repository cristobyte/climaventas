import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants';

@ApiTags('Analíticas')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener dashboard principal' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Datos del dashboard' })
  getDashboard(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.analyticsService.getDashboard(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get('sales-funnel')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener embudo de ventas' })
  @ApiResponse({ status: 200, description: 'Datos del embudo' })
  getSalesFunnel() {
    return this.analyticsService.getSalesFunnel();
  }

  @Get('agent-performance')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener rendimiento de agentes' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Rendimiento de agentes' })
  getAgentPerformance(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.analyticsService.getAgentPerformance(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get('commissions')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener reporte de comisiones' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'agentId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Reporte de comisiones' })
  getCommissions(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.analyticsService.getCommissionReport(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
      agentId,
    );
  }

  @Get('customer-retention')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener métricas de retención' })
  @ApiResponse({ status: 200, description: 'Métricas de retención' })
  getCustomerRetention() {
    return this.analyticsService.getCustomerRetention();
  }

  @Get('revenue-forecast')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener proyección de ingresos' })
  @ApiResponse({ status: 200, description: 'Proyección de ingresos' })
  getRevenueForecast() {
    return this.analyticsService.getRevenueForecast();
  }
}
