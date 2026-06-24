import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionType, UserRole } from '@prisma/client';
import { FinancialService } from './financial.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClinicId } from '../../common/decorators/clinic.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) {}

  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreateTransactionDto) {
    return this.financialService.create(clinicId, dto);
  }

  @Get()
  findAll(
    @ClinicId() clinicId: string,
    @Query('type') type?: TransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.findAll(clinicId, { type, startDate, endDate });
  }

  @Get('summary')
  summary(
    @ClinicId() clinicId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialService.summary(clinicId, startDate, endDate);
  }

  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.financialService.findOne(clinicId, id);
  }

  @Delete(':id')
  remove(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.financialService.remove(clinicId, id);
  }
}
