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
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, InteractionType } from '../common/constants';

@ApiTags('Interacciones')
@Controller('interactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las interacciones' })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: InteractionType })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de interacciones' })
  findAll(
    @Request() req: any,
    @Query('customerId') customerId?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: InteractionType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.interactionsService.findAll(
      {
        customerId,
        userId,
        type,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
      },
      req.user.role,
      req.user.userId,
    );
  }

  @Get('stats')
  @Roles(Role.MANAGEMENT, Role.ANALYTICS)
  @ApiOperation({ summary: 'Obtener estadísticas de interacciones' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Estadísticas' })
  getStats(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    return this.interactionsService.getStats(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una interacción por ID' })
  @ApiResponse({ status: 200, description: 'Interacción encontrada' })
  @ApiResponse({ status: 404, description: 'Interacción no encontrada' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.findOne(id, req.user.role, req.user.userId);
  }

  @Post()
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Crear una nueva interacción' })
  @ApiResponse({ status: 201, description: 'Interacción creada' })
  create(@Body() createInteractionDto: CreateInteractionDto, @Request() req: any) {
    return this.interactionsService.create(createInteractionDto, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @Roles(Role.MANAGEMENT, Role.AGENT)
  @ApiOperation({ summary: 'Actualizar una interacción' })
  @ApiResponse({ status: 200, description: 'Interacción actualizada' })
  @ApiResponse({ status: 404, description: 'Interacción no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateInteractionDto: UpdateInteractionDto,
    @Request() req: any,
  ) {
    return this.interactionsService.update(id, updateInteractionDto, req.user.role, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.MANAGEMENT)
  @ApiOperation({ summary: 'Eliminar una interacción' })
  @ApiResponse({ status: 200, description: 'Interacción eliminada' })
  @ApiResponse({ status: 404, description: 'Interacción no encontrada' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.interactionsService.remove(id, req.user.role, req.user.userId);
  }
}
