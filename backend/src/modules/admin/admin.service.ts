import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async provision(dto: {
    tenantName: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
    townClientId?: string;
  }) {
    const { tenantName, adminName, adminEmail, adminPassword } = dto;

    if (!tenantName || !adminName || !adminEmail || !adminPassword) {
      throw new BadRequestException('tenantName, adminName, adminEmail e adminPassword são obrigatórios');
    }

    const emailTaken = await this.prisma.user.findFirst({
      where: { email: adminEmail.toLowerCase() },
    });
    if (emailTaken) throw new BadRequestException('E-mail já cadastrado no CRM');

    const baseSlug = slugify(tenantName);
    if (!baseSlug) throw new BadRequestException('tenantName inválido');

    let slug = baseSlug;
    for (let i = 1; i <= 50; i++) {
      const exists = await this.prisma.tenant.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${baseSlug}-${i}`;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName, slug },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: adminName,
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'ADMIN',
        },
      });

      const pipeline = await tx.pipeline.create({
        data: {
          tenantId: tenant.id,
          name: 'Pipeline Principal',
          area: 'geral',
          isDefault: true,
        },
      });

      await tx.stage.createMany({
        data: [
          { pipelineId: pipeline.id, name: 'Novo Lead', order: 1 },
          { pipelineId: pipeline.id, name: 'Primeiro Contato', order: 2 },
          { pipelineId: pipeline.id, name: 'Qualificação', order: 3 },
          { pipelineId: pipeline.id, name: 'Proposta', order: 4 },
          { pipelineId: pipeline.id, name: 'Fechado', order: 5, isWon: true },
          { pipelineId: pipeline.id, name: 'Perdido', order: 6, isLost: true },
        ],
      });

      return { tenant, user };
    });

    return {
      tenantId: result.tenant.id,
      tenantSlug: result.tenant.slug,
      tenantName: result.tenant.name,
      adminEmail: result.user.email,
    };
  }

  async impersonate(tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, role: 'ADMIN', isActive: true },
      include: { tenant: true },
    });

    if (!user) throw new BadRequestException('Nenhum admin encontrado para este tenant');

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

  async resetAdminPassword(tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { tenantId, role: 'ADMIN', isActive: true },
      include: { tenant: true },
    });

    if (!user) throw new BadRequestException('Nenhum admin encontrado para este tenant');

    const newPassword = 'Town@' + Math.random().toString(36).slice(2, 10);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return {
      email: user.email,
      password: newPassword,
      tenantId,
      tenantName: user.tenant.name,
    };
  }

  async listTenantsWithStats() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        _count: { select: { leads: true, users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      createdAt: t.createdAt,
      leadsCount: t._count.leads,
      usersCount: t._count.users,
    }));
  }

  async getTenantStats(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new BadRequestException('Tenant não encontrado');

    const [leadsActive, stages, recentLeads] = await Promise.all([
      this.prisma.lead.count({ where: { tenantId, isActive: true } }),
      this.prisma.stage.findMany({
        where: { pipeline: { tenantId } },
        include: { _count: { select: { leads: true } } },
        orderBy: { order: 'asc' },
      }),
      this.prisma.lead.findMany({
        where: { tenantId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          createdAt: true,
          stage: { select: { name: true, isWon: true, isLost: true } },
        },
      }),
    ]);

    return {
      tenantId,
      tenantName: tenant.name,
      leadsActive,
      stages: stages.map((s) => ({
        id: s.id,
        name: s.name,
        count: s._count.leads,
        isWon: s.isWon,
        isLost: s.isLost,
      })),
      recentLeads,
    };
  }
}
