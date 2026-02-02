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
import { PartnershipsService } from './partnerships.service';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { UpdatePartnershipDto } from './dto/update-partnership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants';

@ApiTags('Alianzas')
@Controller('partnerships')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PartnershipsController {
  constructor(private readonly partnershipsService: PartnershipsService) {}

  @Get()
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Listar todas las alianzas' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de alianzas' })
  findAll(@Query('isActive') isActive?: boolean, @Query('search') search?: string) {
    return this.partnershipsService.findAll({ isActive, search });
  }

  @Get('stats')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener estadísticas de alianzas' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats() {
    return this.partnershipsService.getStats();
  }

  @Get(':id')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener una alianza por ID' })
  @ApiResponse({ status: 200, description: 'Alianza encontrada' })
  @ApiResponse({ status: 404, description: 'Alianza no encontrada' })
  findOne(@Param('id') id: string) {
    return this.partnershipsService.findOne(id);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear una nueva alianza' })
  @ApiResponse({ status: 201, description: 'Alianza creada' })
  create(@Body() createPartnershipDto: CreatePartnershipDto) {
    return this.partnershipsService.create(createPartnershipDto);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar una alianza' })
  @ApiResponse({ status: 200, description: 'Alianza actualizada' })
  @ApiResponse({ status: 404, description: 'Alianza no encontrada' })
  update(@Param('id') id: string, @Body() updatePartnershipDto: UpdatePartnershipDto) {
    return this.partnershipsService.update(id, updatePartnershipDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Eliminar una alianza' })
  @ApiResponse({ status: 200, description: 'Alianza eliminada' })
  @ApiResponse({ status: 404, description: 'Alianza no encontrada' })
  @ApiResponse({ status: 403, description: 'Alianza tiene referidos asociados' })
  remove(@Param('id') id: string) {
    return this.partnershipsService.remove(id);
  }
}
