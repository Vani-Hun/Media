import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareerModule } from 'src/career/career.module';
import { MailboxModule } from 'src/mailbox/mailbox.module';
import { Applicant } from './applicant.entity';
import { ApplicantService } from './applicant.service';

@Module({
  imports: [
    MailboxModule,
    forwardRef(()=>CareerModule),
    TypeOrmModule.forFeature([Applicant])
  ],
  providers: [ApplicantService],
  exports: [ApplicantService],
})
export class ApplicantModule {}