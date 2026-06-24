import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClinicId } from '../../common/decorators/clinic.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreatePetDto) {
    return this.petsService.create(clinicId, dto);
  }

  @Get()
  findAll(@ClinicId() clinicId: string, @Query('ownerId') ownerId?: string) {
    return this.petsService.findAll(clinicId, ownerId);
  }

  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.petsService.findOne(clinicId, id);
  }

  @Put(':id')
  update(@ClinicId() clinicId: string, @Param('id') id: string, @Body() dto: CreatePetDto) {
    return this.petsService.update(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.petsService.remove(clinicId, id);
  }
}
