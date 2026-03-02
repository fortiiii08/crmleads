import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
      },
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, tenantId: true, tenant: { select: { id: true, name: true, slug: true } } },
    });
  }
}
