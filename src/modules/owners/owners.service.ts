import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOwnerDto } from './dto/create-owner.dto';

@Injectable()
export class OwnersService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, dto: CreateOwnerDto) {
    if (dto.cpf) {
      const exists = await this.prisma.owner.findFirst({
        where: { cpf: dto.cpf, clinicId },
      });
      if (exists) throw new ConflictException('CPF já cadastrado nesta clínica.');
    }

    return this.prisma.owner.create({ data: { ...dto, clinicId } });
  }

  async findAll(clinicId: string, search?: string) {
    return this.prisma.owner.findMany({
      where: {
        clinicId,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { _count: { select: { pets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, clinicId },
      include: {
        pets: {
          select: { id: true, name: true, species: true, breed: true },
        },
      },
    });

    if (!owner) throw new NotFoundException('Dono não encontrado.');
    return owner;
  }

  async update(clinicId: string, id: string, dto: Partial<CreateOwnerDto>) {
    await this.findOne(clinicId, id);
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    await this.prisma.owner.delete({ where: { id } });
    return { message: 'Dono removido com sucesso.' };
  }
}
