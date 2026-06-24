import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClinicDto) {
    if (dto.cnpj) {
      const exists = await this.prisma.clinic.findUnique({ where: { cnpj: dto.cnpj } });
      if (exists) throw new ConflictException('CNPJ já cadastrado.');
    }

    return this.prisma.clinic.create({ data: dto });
  }

  async findAll() {
    return this.prisma.clinic.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, cnpj: true, phone: true, email: true, active: true },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: { _count: { select: { users: true, pets: true, owners: true } } },
    });

    if (!clinic) throw new NotFoundException('Clínica não encontrada.');
    return clinic;
  }

  async update(id: string, dto: Partial<CreateClinicDto>) {
    await this.findOne(id);
    return this.prisma.clinic.update({ where: { id }, data: dto });
  }
}
