import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { storage } from 'src/common/utils/multer.config';
import { CustomerModule } from 'src/customer/customer.module';
import { HomeModule } from 'src/home/home.module';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    forwardRef(() => CommonModule),
    HomeModule,
    CustomerModule,
    MulterModule.register({ storage }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule { }
