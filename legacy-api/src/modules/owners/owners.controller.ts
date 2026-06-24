import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClinicId } from '../../common/decorators/clinic.decorator';

@UseGuards(JwtAuthGuard)
@Controller('owners')
export class OwnersController {
  constructor(private ownersService: OwnersService) {}

  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreateOwnerDto) {
    return this.ownersService.create(clinicId, dto);
  }

  @Get()
  findAll(@ClinicId() clinicId: string, @Query('search') search?: string) {
    return this.ownersService.findAll(clinicId, search);
  }

  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.ownersService.findOne(clinicId, id);
  }

  @Put(':id')
  update(@ClinicId() clinicId: string, @Param('id') id: string, @Body() dto: CreateOwnerDto) {
    return this.ownersService.update(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.ownersService.remove(clinicId, id);
  }
}
