import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository, getConnection, getManager, getRepository } from 'typeorm';
import { Video } from './video.entity';
import { Customer } from 'src/customer/customer.entity';
import { createReadStream } from 'fs';
import { Comment } from 'src/comment/comment.entity';
import { error } from 'console';
import { CustomerService } from 'src/customer/customer.service';
import { CommentService } from 'src/comment/comment.service';
import { NotificationService } from 'src/notification/notification.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { NotificationMess, NotificationType } from 'src/notification/notitfication.entity';
@Injectable()
export class VideoService extends BaseService<Video> {
    constructor(@Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
        @InjectRepository(Video) repo: Repository<Video>,
        @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService,
        private commentService: CommentService,
        private notificationService: NotificationService
    ) {
        super(repo);
    }

    async create(url: object, input, res) {
        try {
            const video = await this.repo.create({
                video: url['videoURL'],
                thumbnail: url['imageURL'],
                name: input.video.filename,
                user: input.id,
                who: input.who,
                allowComment: Boolean(input.allowComment),
                caption: input.caption,
            });
            await this.repo.save(video);
            const customer = await this.customerService.getUser(input)
            return res.render('customer/profile', { customer })
        } catch (error) {
            throw new HttpException(`Failed to create video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUploadVideo(input) {
        return await this.customerService.getUser(input)
    }
    async uploadVideo(input) {
        try {
            const uploadFirebase = await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async (transaction) => {
                const base64Data = input.image.replace(/^data:image\/jpeg;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const videoStream = createReadStream(input.video.path);
                const videoFile = this.firebaseConfig.bucket.file(`videos/${input.video.filename}`);
                const imageFile = this.firebaseConfig.bucket.file(`thumbnail/${input.video.filename}`);

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

    async updateView(input) {
        try {
            const video = await this.repo.createQueryBuilder('video')
                .leftJoinAndSelect('video.user', 'user')
                .where('video.id = :id', { id: input.videoId })
                .getOneOrFail();

            if (video.user.id !== input.id) {
                video.views++;
            }
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update view: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateLike(input) {
        try {
            const video = await this.repo.createQueryBuilder('video')
                .leftJoinAndSelect('video.likers', 'likers')
                .leftJoinAndSelect('video.user', 'user')
                .where('video.id = :id', { id: input.videoId })
                .getOneOrFail();
            const newUser = new Customer();
            newUser.id = input.id;
            video.likers.push(newUser);
            video.likes++;
            await this.repo.save(video);
            if (input.id !== video.user.id) {
                input.video = video
                input.type = NotificationType.LIKE
                input.mess = NotificationMess.LIKE
                return await this.notificationService.createNotification(input)
            } else {
                return { video }

            }
        } catch (error) {
            throw new HttpException(`Failed to update like: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateDisLike(input) {
        try {
            const video = await this.repo.createQueryBuilder('video')
                .leftJoinAndSelect('video.likers', 'likers')
                .where('video.id = :id', { id: input.videoId })
                .getOneOrFail();
            video.likers = video.likers.filter(liker => liker.id !== input.id);
            video.likes--;
            input = { video, type: NotificationType.LIKE, ...input }
            await this.notificationService.deleteNotification(input);
            return await this.repo.save(video);

        } catch (error) {
            throw new HttpException(`Failed to update dislike: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateShare(input) {
        try {
            const video = await this.repo.findOneOrFail({ where: { id: input.videoId } });
            video.shareCount++;
            return await this.repo.save(video);
        } catch (error) {
            throw new HttpException(`Failed to update share: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createComment(input) {

        try {
            const video = await this.repo.createQueryBuilder('video')
                .leftJoinAndSelect('video.user', 'user')
                .where('video.id = :id', { id: input.videoId })
                .getOneOrFail();
            await this.commentService.create(input)
            if (input.id !== video.user.id) {
                input.video = video
                input.type = NotificationType.COMMENT
                input.mess = `${NotificationMess.COMMENT} ${input.mess}`
                return await this.notificationService.createNotification(input)
            } else {
                return video
            }

        } catch (error) {
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.NOT_IMPLEMENTED);
        }
    }
    async getVideos(input) {
        const videos = await this.repo.createQueryBuilder('video')
            .where('video.who = :who', { who: 'Public' })
            .andWhere('user.id  <> :userId', { userId: input.id })
            .orderBy('video.createAt', 'DESC')
            .leftJoinAndSelect('video.user', 'user')
            .leftJoinAndSelect('video.likers', 'likers')
            .leftJoinAndSelect('video.comments', 'comments')
            .leftJoinAndSelect('comments.video', 'video2')
            .leftJoinAndSelect('comments.customer', 'customer')
            .getMany()
        const customer = await this.customerService.getUser(input);

        return { videos, customer, video: null };
    }

    async getVideoById(input) {
        try {
            const { videos, customer } = await this.getVideos(input)
            let video = await this.repo.createQueryBuilder('video')
                .where('video.id  = :id', { id: input.videoId })
                .orderBy('video.createAt', 'DESC')
                .leftJoinAndSelect('video.user', 'user')
                .leftJoinAndSelect('video.likers', 'likers')
                .leftJoinAndSelect('video.comments', 'comments')
                .leftJoinAndSelect('comments.video', 'video2')
                .leftJoinAndSelect('comments.customer', 'customer')
                .getOne()

            if (video.user.id !== input.id && video.who === "Private") {
                console.log("Private:")
                video = null
            } else if (video.user.id !== input.id && video.who === "Friends") {
                const isFollowing = customer.following.some(user => user.id === video.user.id);
                const isFollower = customer.followers.some(user => user.id === video.user.id);
                if (!isFollowing || !isFollower) {
                    video = null
                }
            }
            return { video, videos, customer }
        } catch (error) {
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.NOT_IMPLEMENTED);
        }
    }

    async getVideo(input) {
        const video = await this.repo.createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .leftJoinAndSelect('video.comments', 'comments')
            .leftJoinAndSelect('comments.video', 'commentVideo')
            .leftJoinAndSelect('comments.customer', 'commentCustomer')
            .leftJoinAndSelect('video.likers', 'likers')
            .where('video.id = :id', { id: input.id })
            .getOne();

        return { video };
    }
    async delete(input) {
        const video = await this.repo
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .leftJoinAndSelect('video.likers', 'likers')
            .leftJoinAndSelect('video.comments', 'comments')
            .where('video.id = :id', { id: input.videoId })
            .getOne();

        if (video.user.id === input.id) {
            await this.commentService.delete(input.videoId)
            await this.repo.remove(video)
            return await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async () => {
                await Promise.all([
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`covers/${video.name}`).delete(),
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`videos/${video.name}`).delete()
                ])
            })
        } else {
            throw new HttpException('Failed delete', HttpStatus.NOT_IMPLEMENTED)
        }
    }

}