import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/multer.config';
import { CommonModule } from 'src/common/common.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
import { NotificationModule } from 'src/notification/notification.module';
import { CustomerModule } from 'src/customer/customer.module';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './conversation.entity';
import { MessageModule } from 'src/message/message.module';
@Module({
    imports: [
        forwardRef(() => CustomerModule),
        forwardRef(() => CommonModule),
        forwardRef(() => MessageModule),
        NotificationModule,
        TypeOrmModule.forFeature([Conversation]),
        MulterModule.register({ storage }),
        FirebaseConfigModule
    ],
    providers: [ConversationService],
    controllers: [ConversationController],
    exports: [ConversationService],
})
export class ConversationModule { }
