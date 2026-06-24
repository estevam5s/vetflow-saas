import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        clinicId: dto.clinicId,
        active: true,
      },
      include: {
        clinic: {
          select: { id: true, name: true, active: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.clinic.active) {
      throw new UnauthorizedException('Clínica inativa.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, clinicId: user.clinicId, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
      },
    };
  }

  async profile(userId: string, clinicId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, clinicId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        clinic: { select: { id: true, name: true } },
      },
    });
  }
}
