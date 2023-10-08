import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantModule } from 'src/applicant/applicant.module';
import { ContactModule } from 'src/contact/contact.module';
import { CareerController } from './career.controller';
import { Career } from './career.entity';
import { CareerService } from './career.service';

@Module({
  imports: [ContactModule, ApplicantModule, TypeOrmModule.forFeature([Career])],
  controllers: [CareerController],
  providers: [CareerService],
  exports: [CareerService],
})
export class CareerModule {}
