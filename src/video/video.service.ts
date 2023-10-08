import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { AppGateway } from 'src/common/services/websocket.service';
import { relative } from 'path';
@Injectable()
export class VideoService extends BaseService<Video> {
    constructor(
        @InjectRepository(Video) repo: Repository<Video>,
        private readonly gateway: AppGateway
    ) {
        super(repo);
    }

    async create(url: string, input) {
        const video = await this.repo.create({ video: url, user: input.user.id, description: input.description })
        return this.repo.save(video)
    }

    async get() {
        const video = await this.repo.find({ relations: ['user'] })
        return video
    }
    async getVideoById(id: string): Promise<Video> {
        const video = await this.repo.findOne(id, { relations: ['comments', 'comments.replies'] });
        if (!video) {
            throw new UnauthorizedException('Your username is exist!!');
        }
        return video;
    }
    async likeVideo(videoId: string, userId: string): Promise<void> {
        // Xử lý logic khi có sự kiện thích video
        // ...

        // Sau khi xử lý, gửi thông báo đến tất cả các client WebSocket
        const payload = { videoId, userId };
        this.gateway.handleLikeEvent(null, payload);
    }
}