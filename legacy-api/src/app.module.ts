import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { OwnersModule } from './modules/owners/owners.module';
import { PetsModule } from './modules/pets/pets.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { FinancialModule } from './modules/financial/financial.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ClinicsModule,
    OwnersModule,
    PetsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    FinancialModule,
  ],
})
export class AppModule {}
