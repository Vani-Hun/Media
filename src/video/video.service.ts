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
        const video = await this.repo.create({
            video: url['videoURL'],
            cover: url['imageURL'],
            user: input.user.id,
            who: input.who,
            allowComment: Boolean(input.allowComment),
            caption: input.caption,
        });
        return this.repo.save(video)
    }

    async update(input) {
        console.log("input:", input)
        return await this.repo.query(`
        UPDATE video
        SET who = ?, allowComment = ?
        WHERE id = ?;
`, [input.who, input.allowComment, input.video]);
    }

    async get() {
        const video = await this.repo.find({ relations: ['user'] })
        return video
    }
    async getVideoById(id) {
        const video = await this.repo.findOne({
            where: {
                id: id
            }
        });
        if (!video) {
            throw new UnauthorizedException('Your video is not exist!!');
        }
        return video;
    }
    async delete(id, user) {
        const video = await this.repo
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user') // Join bảng video với bảng user và select thông tin user
            .where('video.id = :id', { id: id })
            .getOne();
        if (video.user.id === user.id) {
            return await this.repo.delete(id)
        }

    }
    async likeVideo(videoId: string, userId: string): Promise<void> {
        // Xử lý logic khi có sự kiện thích video
        // ...

        // Sau khi xử lý, gửi thông báo đến tất cả các client WebSocket
        const payload = { videoId, userId };
        this.gateway.handleLikeEvent(null, payload);
    }
}