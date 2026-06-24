import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClinicId } from '../../common/decorators/clinic.decorator';

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(clinicId, dto);
  }

  @Get()
  findAll(
    @ClinicId() clinicId: string,
    @Query('status') status?: AppointmentStatus,
    @Query('vetId') vetId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll(clinicId, { status, vetId, date });
  }

  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentsService.findOne(clinicId, id);
  }

  @Put(':id')
  update(@ClinicId() clinicId: string, @Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(clinicId, id, dto);
  }

  @Delete(':id')
  cancel(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.appointmentsService.cancel(clinicId, id);
  }
}
