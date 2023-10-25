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

    async create(url: object, input) {
        const video = await this.repo.create({ video: url['videoURL'], cover: url['imgURL'], user: input.user.id, who: input.who, allowComment: input.allowUsers, caption: input.caption })
        return this.repo.save(video)
    }

    async get() {
        const video = await this.repo.find({ relations: ['user'] })
        return video
    }
    async getVideoById(id: string) {
        const videos = await this.repo.find({
            where: {
                user: { id: id }
            }
        });
        if (!videos) {
            console.log("video:", videos)
            throw new UnauthorizedException('Your username is exist!!');
        }
        return videos;
    }
    async likeVideo(videoId: string, userId: string): Promise<void> {
        // Xử lý logic khi có sự kiện thích video
        // ...

        // Sau khi xử lý, gửi thông báo đến tất cả các client WebSocket
        const payload = { videoId, userId };
        this.gateway.handleLikeEvent(null, payload);
    }
}