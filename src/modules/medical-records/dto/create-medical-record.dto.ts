import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  petId: string;

  @IsString()
  @IsNotEmpty()
  vetId: string;

  @IsOptional()
  @IsDateString()
  attendedAt?: string;

  @IsOptional()
  @IsString()
  anamnesis?: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  treatment: string;

  @IsOptional()
  @IsString()
  prescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
