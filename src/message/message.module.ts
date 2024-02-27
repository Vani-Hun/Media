import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/multer.config';
import { CommonModule } from 'src/common/common.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
import { NotificationModule } from 'src/notification/notification.module';
import { CustomerModule } from 'src/customer/customer.module';
import { ConversationModule } from 'src/conversation/conversation.module';
@Module({
    imports: [
        forwardRef(() => CustomerModule),
        forwardRef(() => CommonModule),
        forwardRef(() => ConversationModule),
        NotificationModule,
        TypeOrmModule.forFeature([Message]),
        MulterModule.register({ storage }),
        FirebaseConfigModule
    ],
    providers: [MessageService],
    controllers: [MessageController],
    exports: [MessageService],
})
export class MessageModule { }
