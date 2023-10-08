import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mailbox } from './mailbox.entity';
import { MailboxService } from './mailbox.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mailbox])
  ],
  providers: [MailboxService],
  exports: [MailboxService],
})
export class MailboxModule {}