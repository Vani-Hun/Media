import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutUsModule } from 'src/aboutUs/aboutUs.module';
import { PersonnelController } from './personnel.controller';
import { Personnel } from './personnel.entity';
import { PersonnelService } from './personnel.service';

@Module({
  imports: [TypeOrmModule.forFeature([Personnel]), AboutUsModule],
  providers: [PersonnelService],
  controllers: [PersonnelController],
  exports: [PersonnelService],
})
export class PersonnelModule {}
