import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    pet: { select: { id: true, name: true, species: true, breed: true } },
    vet: { select: { id: true, name: true } },
  };

  async create(clinicId: string, dto: CreateMedicalRecordDto) {
    const [pet, vet] = await Promise.all([
      this.prisma.pet.findFirst({ where: { id: dto.petId, clinicId } }),
      this.prisma.user.findFirst({ where: { id: dto.vetId, clinicId } }),
    ]);

    if (!pet) throw new BadRequestException('Pet não encontrado nesta clínica.');
    if (!vet) throw new BadRequestException('Veterinário não encontrado nesta clínica.');

    return this.prisma.medicalRecord.create({
      data: {
        ...dto,
        clinicId,
        attendedAt: dto.attendedAt ? new Date(dto.attendedAt) : new Date(),
      },
      include: this.include,
    });
  }

  async findByPet(clinicId: string, petId: string) {
    const pet = await this.prisma.pet.findFirst({ where: { id: petId, clinicId } });
    if (!pet) throw new NotFoundException('Pet não encontrado.');

    return this.prisma.medicalRecord.findMany({
      where: { clinicId, petId },
      include: this.include,
      orderBy: { attendedAt: 'desc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, clinicId },
      include: {
        ...this.include,
        pet: {
          include: {
            owner: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
      },
    });

    if (!record) throw new NotFoundException('Prontuário não encontrado.');
    return record;
  }

  async update(clinicId: string, id: string, dto: Partial<CreateMedicalRecordDto>) {
    await this.findOne(clinicId, id);

    const data: any = { ...dto };
    if (dto.attendedAt) data.attendedAt = new Date(dto.attendedAt);

    return this.prisma.medicalRecord.update({
      where: { id },
      data,
      include: this.include,
    });
  }
}
