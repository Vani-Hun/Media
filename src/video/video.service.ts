import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { AppGateway } from 'src/common/services/websocket.service';
import { relative } from 'path';
import { createReadStream } from 'fs';
import { bucket, firebaseAdmin } from 'src/common/utils/firebase.config';
import { Admin } from 'src/admin/admin.entity';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
@Injectable()
export class VideoService extends BaseService<Video> {
    constructor(
        @InjectRepository(Video) repo: Repository<Video>,
        private readonly gateway: AppGateway

    ) {
        super(repo);
    }

    async create(url: object, input) {
        console.log("input:", input)
        const video = await this.repo.create({
            video: url['videoURL'],
            cover: url['imageURL'],
            name: input.video.filename,
            user: input.user.id,
            who: input.who,
            allowComment: Boolean(input.allowComment),
            caption: input.caption,
        });
        return await this.repo.save(video)
    }

    async uploadVideo(input) {
        try {
            const base64Data = input.image.replace(/^data:image\/jpeg;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const videoStream = createReadStream(input.video.path);
            const videoFile = bucket.file(`videos/${input.video.filename}`);
            const imageFile = bucket.file(`covers/${input.video.filename}`);
            const uploadStream = await videoFile.createWriteStream({
                metadata: {
                    contentType: 'video/mp4',
                },
            })
            // Sử dụng Promise.allSettled() để đảm bảo rằng tất cả các promise đã được giải quyết
            const results = await Promise.allSettled([
                new Promise((resolve, reject) => {
                    videoStream.pipe(uploadStream)
                        .on('finish', resolve)
                        .on('error', reject);
                }),
                imageFile.save(imageBuffer, {
                    metadata: {
                        contentType: 'image/jpeg',
                    },
                }),
            ]);

            // Kiểm tra kết quả của các promise
            for (const result of results) {
                if (result.status === 'rejected') {
                    throw result.reason;
                }
            }


            await uploadStream.end();
            await this.clearTmp(input.video.path);

            const [imgRef, fileRef] = await Promise.all([
                getStorage().bucket(`${bucket.name}`).file(`${imageFile.name}`),
                getStorage().bucket(`${bucket.name}`).file(`${videoFile.name}`),
            ]);
            const [imageURL, videoURL] = await Promise.all([
                getDownloadURL(imgRef),
                getDownloadURL(fileRef),
            ]);
            if (imageURL && videoURL) {
                return { imageURL, videoURL };
            }
        } catch (error) {
            console.error(error);
        }
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
        };
        return video;
    }

    async delete(id, user) {
        const video = await this.repo
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user') // Join bảng video với bảng user và select thông tin user
            .where('video.id = :id', { id: id })
            .getOne();
        if (video.user.id === user.id) {
            console.log("video:", video)
            await this.repo.delete(id);
            return await firebaseAdmin.firestore().runTransaction(async () => {
                await Promise.all([
                    firebaseAdmin.storage().bucket().file(`covers/${video.name}`).delete(),
                    firebaseAdmin.storage().bucket().file(`videos/${video.name}`).delete()
                ])
            })
        } else { throw new UnauthorizedException('Failed'); }
    }

    async likeVideo(videoId: string, userId: string): Promise<void> {
        // Xử lý logic khi có sự kiện thích video
        // ...

        // Sau khi xử lý, gửi thông báo đến tất cả các client WebSocket
        const payload = { videoId, userId };
        this.gateway.handleLikeEvent(null, payload);
    }
}