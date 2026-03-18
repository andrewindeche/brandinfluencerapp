import { NotificationService } from "./notification.service";
import { Module } from '@nestjs/common';
import { NotificationGateway } from "./notification.gateway";

@Module({
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}