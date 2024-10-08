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
import { NotificationModule } from 'src/notification/notification.module';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { HashtagModule } from 'src/hashtag/hashtag.module';
import { AdminModule } from 'src/admin/admin.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    forwardRef(() => CommonModule),
    forwardRef(() => AdminModule),
    forwardRef(() => VideoModule),
    forwardRef(() => ConversationModule),
    NotificationModule,
    MessageModule,
    TypeOrmModule.forFeature([Customer]),
    MulterModule.register({ storage }),
    FirebaseConfigModule,
    PaymentModule
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule { }
