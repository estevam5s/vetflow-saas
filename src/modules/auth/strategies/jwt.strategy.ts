import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

interface JwtPayload {
  sub: string;
  clinicId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        clinicId: payload.clinicId,
        active: true,
      },
      select: {
        id: true,
        clinicId: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    }

    return user;
  }
}
