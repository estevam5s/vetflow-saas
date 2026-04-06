import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  vetId: string;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
