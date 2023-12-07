import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository, getConnection, getManager, getRepository } from 'typeorm';
import { Video } from './video.entity';
import { createReadStream } from 'fs';
import { Comment } from 'src/comment/comment.entity';
import { error } from 'console';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

@Injectable()
export class VideoService extends BaseService<Video> {
    constructor(@Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
        @InjectRepository(Video) repo: Repository<Video>
    ) {
        super(repo);
    }

    async create(url: object, input) {
        try {
            const video = await this.repo.create({
                video: url['videoURL'],
                thumbnail: url['imageURL'],
                name: input.video.filename,
                user: input.user.id,
                who: input.who,
                allowComment: Boolean(input.allowComment),
                caption: input.caption,
            });
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to create video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadVideo(input) {
        try {
            const uploadFirebase = await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async (transaction) => {
                const base64Data = input.image.replace(/^data:image\/jpeg;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const videoStream = createReadStream(input.video.path);
                const videoFile = this.firebaseConfig.bucket.file(`videos/${input.video.filename}`);
                const imageFile = this.firebaseConfig.bucket.file(`covers/${input.video.filename}`);

                const uploadStream = await videoFile.createWriteStream({
                    metadata: {
                        contentType: 'video/mp4',
                    },
                });
                await Promise.all([
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

                await uploadStream.end();

                const [imgRef, fileRef] = await Promise.all([
                    getStorage().bucket(`${this.firebaseConfig.bucket.name}`).file(`${imageFile.name}`),
                    getStorage().bucket(`${this.firebaseConfig.bucket.name}`).file(`${videoFile.name}`),
                ]);
                const [imageURL, videoURL] = await Promise.all([
                    getDownloadURL(imgRef),
                    getDownloadURL(fileRef),
                ]);
                return { imageURL, videoURL };
            });
            await this.clearTmp(input.video.path);
            if (uploadFirebase) {
                return uploadFirebase
            }
        } catch (error) {
            await this.clearTmp(input.video.path);
            throw new HttpException(`Failed to upload video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async update(input) {
        try {
            return await this.repo.query(`
      UPDATE video
      SET who = ?, allowComment = ?
      WHERE id = ?;
    `, [input.who, input.allowComment, input.video]);
        } catch (error) {
            throw new HttpException(`Failed to update video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateView(input, customer) {
        try {
            const video = await this.repo.findOneOrFail(input.videoId, { relations: ['user'] });
            if (video.user.id !== customer.id) {
                video.views++;
            }
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update view: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateLike(input) {
        try {
            const video = await this.repo.findOneOrFail(input.videoId);
            video.likes++;
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update like: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateDisLike(input) {
        try {
            const video = await this.repo.findOneOrFail(input.videoId);
            video.likes--;
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update dislike: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateShare(input) {
        try {
            const video = await this.repo.findOneOrFail(input.videoId);
            video.shareCount++;
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update share: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async get(): Promise<Video[]> {
        const qb = this.repo.createQueryBuilder('video');
        qb.where('video.who = :who', { who: 'Public' });
        qb.orderBy('video.createAt', 'DESC');
        qb.leftJoinAndSelect('video.user', 'user');
        qb.leftJoinAndSelect('video.likers', 'likers');
        qb.leftJoinAndSelect('video.comments', 'comments');
        // Sử dụng alias 'video2' để phân biệt với bảng video chính
        qb.leftJoinAndSelect('comments.video', 'video2');
        qb.leftJoinAndSelect('comments.customer', 'customer');

        const videos = await qb.getMany();
        return videos;
    }

    async searchVideos(query: string): Promise<Video[]> {
        const results = await this.repo.find({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                        },
                    },
                    {
                        description: {
                            contains: query,
                        },
                    },
                    {
                        hashtag: {
                            contains: query,
                        },
                    },
                ],
            },
        });
        return results;
    }

    async getVideoById(id) {
        return await this.repo.findOne({
            where: {
                id: id
            }, relations: ['user', 'comments', 'comments.video', 'comments.customer', 'likers']
        });
    }

    async delete(id, user) {
        const video = await this.repo
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .leftJoinAndSelect('video.likers', 'likers')
            .leftJoinAndSelect('video.comments', 'comments')
            .where('video.id = :id', { id: id })
            .getOne();

        if (video.user.id === user.id) {
            await this.repo.remove(video)
            return await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async () => {
                await Promise.all([
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`covers/${video.name}`).delete(),
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`videos/${video.name}`).delete()
                ])
            })
        } else {
            throw new HttpException('Failed delete', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}