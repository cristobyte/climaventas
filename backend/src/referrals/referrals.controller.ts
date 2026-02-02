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
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { ConvertReferralDto } from './dto/convert-referral.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ReferralStatus } from '../common/constants';

@ApiTags('Referidos')
@Controller('referrals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Listar todos los referidos' })
  @ApiQuery({ name: 'status', required: false, enum: ReferralStatus })
  @ApiQuery({ name: 'partnershipId', required: false, type: String })
  @ApiQuery({ name: 'referrerCustomerId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de referidos' })
  findAll(
    @Query('status') status?: ReferralStatus,
    @Query('partnershipId') partnershipId?: string,
    @Query('referrerCustomerId') referrerCustomerId?: string,
  ) {
    return this.referralsService.findAll({ status, partnershipId, referrerCustomerId });
  }

  @Get('stats')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener estadísticas de referidos' })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats() {
    return this.referralsService.getStats();
  }

  @Get(':id')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS, Role.AGENT)
  @ApiOperation({ summary: 'Obtener un referido por ID' })
  @ApiResponse({ status: 200, description: 'Referido encontrado' })
  @ApiResponse({ status: 404, description: 'Referido no encontrado' })
  findOne(@Param('id') id: string) {
    return this.referralsService.findOne(id);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear un nuevo referido' })
  @ApiResponse({ status: 201, description: 'Referido creado' })
  create(@Body() createReferralDto: CreateReferralDto) {
    return this.referralsService.create(createReferralDto);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar un referido' })
  @ApiResponse({ status: 200, description: 'Referido actualizado' })
  @ApiResponse({ status: 404, description: 'Referido no encontrado' })
  update(@Param('id') id: string, @Body() updateReferralDto: UpdateReferralDto) {
    return this.referralsService.update(id, updateReferralDto);
  }

  @Patch(':id/convert')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Convertir un referido' })
  @ApiResponse({ status: 200, description: 'Referido convertido' })
  @ApiResponse({ status: 404, description: 'Referido no encontrado' })
  convert(@Param('id') id: string, @Body() convertReferralDto: ConvertReferralDto) {
    return this.referralsService.convert(id, convertReferralDto.bonusAmount);
  }

  @Patch(':id/expire')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Expirar un referido' })
  @ApiResponse({ status: 200, description: 'Referido expirado' })
  @ApiResponse({ status: 404, description: 'Referido no encontrado' })
  expire(@Param('id') id: string) {
    return this.referralsService.expire(id);
  }

  @Delete(':id')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Eliminar un referido' })
  @ApiResponse({ status: 200, description: 'Referido eliminado' })
  @ApiResponse({ status: 404, description: 'Referido no encontrado' })
  remove(@Param('id') id: string) {
    return this.referralsService.remove(id);
  }
}
