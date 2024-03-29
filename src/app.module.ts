/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './common/utils/typeorm.config';
import { CustomerModule } from './customer/customer.module';
import { HomeModule } from './home/home.module';
import { MailboxModule } from './mailbox/mailbox.module';
import { NotificationGateway } from './common/services/websocket.service';

const EnvModule = ConfigModule.forRoot({
  envFilePath: ['.env'],
  isGlobal: true,
});

@Module({
  imports: [
    HomeModule,
    EnvModule,
    AdminModule,
    CustomerModule,
    MailboxModule,
    // MsgWebhookModule,
    DatabaseModule,
  ]
})
export class AppModule { }
