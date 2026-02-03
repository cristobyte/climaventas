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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, LeadStatus } from '../common/constants';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Listar todos los leads' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'agentId', required: false, type: String })
  @ApiQuery({ name: 'minClosureChance', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de leads' })
  findAll(
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('agentId') agentId?: string,
    @Query('minClosureChance') minClosureChance?: number,
  ) {
    return this.leadsService.findAll({
      status,
      customerId,
      agentId,
      minClosureChance: minClosureChance ? Number(minClosureChance) : undefined,
    });
  }

  @Get('stats')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener estadísticas de leads' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get(':id')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener un lead por ID' })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear un nuevo lead' })
  @ApiResponse({ status: 201, description: 'Lead creado' })
  create(@Body() createLeadDto: CreateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.create(createLeadDto, user.userId);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar un lead' })
  @ApiResponse({ status: 200, description: 'Lead actualizado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/won')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Marcar lead como ganado' })
  @ApiResponse({ status: 200, description: 'Lead marcado como ganado' })
  markAsWon(@Param('id') id: string) {
    return this.leadsService.convertToSale(id);
  }

  @Patch(':id/lost')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Marcar lead como perdido' })
  @ApiResponse({ status: 200, description: 'Lead marcado como perdido' })
  markAsLost(@Param('id') id: string) {
    return this.leadsService.markAsLost(id);
  }

  @Delete(':id')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Eliminar un lead' })
  @ApiResponse({ status: 200, description: 'Lead eliminado' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
