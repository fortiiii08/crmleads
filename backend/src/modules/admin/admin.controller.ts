import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  private checkKey(key: string) {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected || key !== expected) {
      throw new UnauthorizedException('API key inválida');
    }
  }

  // POST /api/admin/provision
  // Body: { tenantName, adminName, adminEmail, adminPassword, townClientId? }
  @Post('provision')
  provision(
    @Headers('x-admin-key') key: string,
    @Body() dto: any,
  ) {
    this.checkKey(key);
    return this.adminService.provision(dto);
  }

  // POST /api/admin/impersonate
  // Body: { tenantId }
  // Retorna um JWT do admin daquele tenant (sem precisar de senha)
  @Post('impersonate')
  impersonate(
    @Headers('x-admin-key') key: string,
    @Body() dto: { tenantId: string },
  ) {
    this.checkKey(key);
    return this.adminService.impersonate(dto.tenantId);
  }

  // POST /api/admin/reset-password
  // Body: { tenantId }
  // Gera nova senha para o admin do tenant e retorna email+senha
  @Post('reset-password')
  resetPassword(
    @Headers('x-admin-key') key: string,
    @Body() dto: { tenantId: string },
  ) {
    this.checkKey(key);
    return this.adminService.resetAdminPassword(dto.tenantId);
  }

  // GET /api/admin/tenants
  @Get('tenants')
  listTenants(@Headers('x-admin-key') key: string) {
    this.checkKey(key);
    return this.adminService.listTenantsWithStats();
  }

  // GET /api/admin/tenants/:tenantId/stats
  @Get('tenants/:tenantId/stats')
  tenantStats(
    @Headers('x-admin-key') key: string,
    @Param('tenantId') tenantId: string,
  ) {
    this.checkKey(key);
    return this.adminService.getTenantStats(tenantId);
  }
}
