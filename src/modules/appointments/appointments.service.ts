import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  private readonly include = {
    pet: { select: { id: true, name: true, species: true, owner: { select: { name: true, phone: true } } } },
    vet: { select: { id: true, name: true } },
  };

  async create(clinicId: string, dto: CreateAppointmentDto) {
    const [pet, vet] = await Promise.all([
      this.prisma.pet.findFirst({ where: { id: dto.petId, clinicId } }),
      this.prisma.user.findFirst({ where: { id: dto.vetId, clinicId } }),
    ]);

    if (!pet) throw new BadRequestException('Pet não encontrado nesta clínica.');
    if (!vet) throw new BadRequestException('Veterinário não encontrado nesta clínica.');

    return this.prisma.appointment.create({
      data: { ...dto, clinicId, scheduledAt: new Date(dto.scheduledAt) },
      include: this.include,
    });
  }

  async findAll(clinicId: string, filters: { status?: AppointmentStatus; vetId?: string; date?: string }) {
    const { status, vetId, date } = filters;

    let dateFilter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      dateFilter = { scheduledAt: { gte: start, lte: end } };
    }

    return this.prisma.appointment.findMany({
      where: {
        clinicId,
        ...(status && { status }),
        ...(vetId && { vetId }),
        ...dateFilter,
      },
      include: this.include,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: this.include,
    });

    if (!appointment) throw new NotFoundException('Consulta não encontrada.');
    return appointment;
  }

  async update(clinicId: string, id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(clinicId, id);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Consulta cancelada não pode ser atualizada.');
    }

    const data: any = { ...dto };
    if (dto.scheduledAt) data.scheduledAt = new Date(dto.scheduledAt);

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  async cancel(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: this.include,
    });
  }
}
