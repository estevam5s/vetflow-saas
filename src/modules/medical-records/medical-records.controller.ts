import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClinicId } from '../../common/decorators/clinic.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(clinicId, dto);
  }

  @Get('pet/:petId')
  findByPet(@ClinicId() clinicId: string, @Param('petId') petId: string) {
    return this.medicalRecordsService.findByPet(clinicId, petId);
  }

  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.medicalRecordsService.findOne(clinicId, id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VET)
  @Put(':id')
  update(@ClinicId() clinicId: string, @Param('id') id: string, @Body() dto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.update(clinicId, id, dto);
  }
}
