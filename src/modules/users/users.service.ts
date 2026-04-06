import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private readonly select = {
    id: true,
    name: true,
    email: true,
    role: true,
    active: true,
    createdAt: true,
  };

  async create(clinicId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findFirst({
      where: { email: dto.email, clinicId },
    });

    if (exists) {
      throw new ConflictException('E-mail já cadastrado nesta clínica.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { ...dto, password: hashed, clinicId },
      select: this.select,
    });
  }

  async findAll(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId },
      select: this.select,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, clinicId },
      select: this.select,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async update(clinicId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(clinicId, id);

    const data: any = { ...dto };
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.select,
    });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    await this.prisma.user.update({
      where: { id },
      data: { active: false },
    });
    return { message: 'Usuário desativado com sucesso.' };
  }
}
