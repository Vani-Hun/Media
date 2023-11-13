import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { VideoService } from './video.service';
import { CommentModule } from 'src/comment/comment.module';
import { CommonModule } from 'src/common/common.module';
import { FirebaseConfigModule } from 'src/common/utils/firebase.config';
@Module({
    imports: [forwardRef(() => CommonModule),
    TypeOrmModule.forFeature([Video]),
        CommentModule, FirebaseConfigModule
    ],
    providers: [VideoService],
    exports: [VideoService],
})
export class VideoModule { }