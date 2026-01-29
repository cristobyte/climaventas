import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, CustomerStage, CustomerSource } from '../common/constants';

@ApiTags('Clientes')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los clientes' })
  @ApiQuery({ name: 'stage', required: false, enum: CustomerStage })
  @ApiQuery({ name: 'source', required: false, enum: CustomerSource })
  @ApiQuery({ name: 'assignedAgentId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  findAll(
    @Request() req: any,
    @Query('stage') stage?: CustomerStage,
    @Query('source') source?: CustomerSource,
    @Query('assignedAgentId') assignedAgentId?: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(
      { stage, source, assignedAgentId, search },
      req.user.role,
      req.user.userId,
    );
  }

  @Get('stats')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener estadísticas de clientes' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.customersService.findOne(id, req.user.role, req.user.userId);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Obtener línea de tiempo del cliente' })
  @ApiResponse({ status: 200, description: 'Línea de tiempo' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  getTimeline(@Param('id') id: string, @Request() req: any) {
    return this.customersService.getTimeline(id, req.user.role, req.user.userId);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente actualizado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req: any,
  ) {
    return this.customersService.update(id, updateCustomerDto, req.user.role, req.user.userId);
  }

  @Patch(':id/stage')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar etapa del cliente' })
  @ApiResponse({ status: 200, description: 'Etapa actualizada' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  updateStage(
    @Param('id') id: string,
    @Body() updateStageDto: UpdateStageDto,
    @Request() req: any,
  ) {
    return this.customersService.updateStage(
      id,
      updateStageDto.stage,
      req.user.role,
      req.user.userId,
    );
  }

  @Delete(':id')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Eliminar un cliente' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 403, description: 'Cliente tiene ventas asociadas' })
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
