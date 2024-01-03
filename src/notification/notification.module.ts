import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notitfication.entity';
import { NotificationService } from './notification.service';
import { CommentModule } from 'src/comment/comment.module';
import { CommonModule } from 'src/common/common.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
import { NotificationController } from './notification.controller';
@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule { }