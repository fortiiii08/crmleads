import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('linkedin/:tenantSlug')
  receiveLinkedIn(@Param('tenantSlug') tenantSlug: string, @Body() payload: any) {
    return this.webhooksService.receiveLinkedIn(tenantSlug, payload);
  }
}
