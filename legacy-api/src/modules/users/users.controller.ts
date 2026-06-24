import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClinicId } from '../../common/decorators/clinic.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@ClinicId() clinicId: string, @Body() dto: CreateUserDto) {
    return this.usersService.create(clinicId, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@ClinicId() clinicId: string) {
    return this.usersService.findAll(clinicId);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.usersService.findOne(clinicId, id);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@ClinicId() clinicId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(clinicId, id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@ClinicId() clinicId: string, @Param('id') id: string) {
    return this.usersService.remove(clinicId, id);
  }
}
