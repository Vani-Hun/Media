import { storage } from 'src/common/utils/multer.config';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { VideoService } from './video.service';
import { CommentModule } from 'src/comment/comment.module';
import { CommonModule } from 'src/common/common.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
import { CustomerModule } from 'src/customer/customer.module';
import { MulterModule } from '@nestjs/platform-express';
import { VideoController } from './video.controller';
import { NotificationModule } from 'src/notification/notification.module';
@Module({
    imports: [
        forwardRef(() => CommonModule),
        forwardRef(() => CustomerModule),
        TypeOrmModule.forFeature([Video]),
        CommentModule,
        NotificationModule,
        FirebaseConfigModule,
        MulterModule.register({ storage })
    ],
    providers: [VideoService],
    controllers: [VideoController],
    exports: [VideoService],
})
export class VideoModule { }