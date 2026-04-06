import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, dto: CreatePetDto) {
    const owner = await this.prisma.owner.findFirst({
      where: { id: dto.ownerId, clinicId },
    });

    if (!owner) {
      throw new BadRequestException('Dono não encontrado nesta clínica.');
    }

    return this.prisma.pet.create({
      data: {
        ...dto,
        clinicId,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      include: { owner: { select: { id: true, name: true, phone: true } } },
    });
  }

  async findAll(clinicId: string, ownerId?: string) {
    return this.prisma.pet.findMany({
      where: { clinicId, ...(ownerId && { ownerId }) },
      include: { owner: { select: { id: true, name: true, phone: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const pet = await this.prisma.pet.findFirst({
      where: { id, clinicId },
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
        medicalRecords: {
          orderBy: { attendedAt: 'desc' },
          take: 5,
          select: { id: true, diagnosis: true, attendedAt: true, vet: { select: { name: true } } },
        },
        appointments: {
          where: { status: 'SCHEDULED' },
          orderBy: { scheduledAt: 'asc' },
          take: 3,
        },
      },
    });

    if (!pet) throw new NotFoundException('Pet não encontrado.');
    return pet;
  }

  async update(clinicId: string, id: string, dto: Partial<CreatePetDto>) {
    await this.findOne(clinicId, id);

    const data: any = { ...dto };
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);

    return this.prisma.pet.update({ where: { id }, data });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    await this.prisma.pet.delete({ where: { id } });
    return { message: 'Pet removido com sucesso.' };
  }
}
