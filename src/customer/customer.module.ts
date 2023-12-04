import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/multer.config';
import { CommonModule } from 'src/common/common.module';
import { VideoModule } from 'src/video/video.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
import { CommentModule } from 'src/comment/comment.module';
@Module({
  imports: [
    forwardRef(() => CommonModule),
    TypeOrmModule.forFeature([Customer]),
    VideoModule,
    CommentModule,
    MulterModule.register({ storage }), FirebaseConfigModule
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule { }
