/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './common/utils/typeorm.config';
import { CustomerModule } from './customer/customer.module';
import { HomeModule } from './home/home.module';
import { MailboxModule } from './mailbox/mailbox.module';

const EnvModule = ConfigModule.forRoot({
  envFilePath: ['.env'],
  isGlobal: true,
});

@Module({
  imports: [
    HomeModule,
    EnvModule,
    CustomerModule,
    AdminModule,
    MailboxModule,
    // MsgWebhookModule,
    DatabaseModule,
  ],
})
export class AppModule { }
