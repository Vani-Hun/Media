import { HashtagService } from './../hashtag/hashtag.service';
import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus, forwardRef, Redirect } from '@nestjs/common';
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
        private notificationService: NotificationService,
        private hashtagService: HashtagService
    ) {
        super(repo);
    }

    private areFriends(customerId: string, users): boolean {

        const areFriends = users.some(user => user.id === customerId)
        return areFriends
    }

    async create(url: object, input, res) {
        console.log("input:", input);
        try {
            let hashtagRegex = /#(\w+)/g;
            let mentionRegex = /@(\w+)/g;

            let hashtags = (input.caption.match(hashtagRegex) || []).map(match => match.substring(1));
            console.log("hashtags:", hashtags)
            let mentions = (input.caption.match(mentionRegex) || []).map(match => match.substring(1));
            console.log("mentions:", mentions)
            let tags = []

            if (hashtags.length > 0) {
                for (const hashtag of hashtags) {
                    input.nameHashTag = hashtag;
                    const tag = await this.hashtagService.getHashTag(input);
                    tags.push(tag);
                }
            }

            const video = await this.repo.create({
                video: url['videoURL'],
                thumbnail: url['imageURL'],
                name: input.video.filename,
                user: input.id,
                who: input.who,
                allowComment: Boolean(input.allowComment),
                caption: input.caption,
                hashtags: tags
            });

            const videoResult = await this.repo.save(video);

            // Kiểm tra xem mentions có rỗng hay không
            if (mentions.length > 0) {
                await Promise.all(mentions.map(async (mention) => {
                    input.mention = mention;
                    const customer = await this.customerService.getSimpleUser(input)
                    input.video = videoResult;
                    input.mess = NotificationMess.MENTIONS_AND_TAGS
                    input.mention = customer.id
                    input.type = NotificationType.MENTIONS_AND_TAGS
                    await this.notificationService.createNotification(input);
                }));
            }

            return res.redirect(`/customer/profile/${input.id}`)
        } catch (error) {
            console.error(`Error in create video: ${error.message}`);
            throw new HttpException(`Failed to create video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getUploadVideo(input) {
        try {
            const customer = await this.customerService.getUser(input)
            return { customer }
        } catch (error) {
            console.error(`Error in googleLogin: ${error.message}`);
            throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
    async uploadVideo(input) {
        try {
            const uploadFirebase = await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async (transaction) => {
                const base64Data = input.image.replace(/^data:image\/jpeg;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                const videoStream = createReadStream(input.video.path);
                const videoFile = this.firebaseConfig.bucket.file(`videos/${input.video.filename}`);
                const imageFile = this.firebaseConfig.bucket.file(`thumbnails/${input.video.filename}`);

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
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getVideos(input) {
        try {
            const publicVideos = await this.repo.createQueryBuilder('video')
                .where('video.who = :who', { who: 'Public' })
                .andWhere('user.id  <> :userId', { userId: input.id })
                .orderBy('video.createdAt', 'DESC')
                .leftJoinAndSelect('video.user', 'user')
                .leftJoinAndSelect('video.likers', 'likers')
                .leftJoinAndSelect('video.comments', 'comments')
                .leftJoinAndSelect('video.hashtags', 'hashtags')
                .leftJoinAndSelect('comments.video', 'video2')
                .leftJoinAndSelect('comments.customer', 'customer')
                .getMany()
            const { videos: videosFollowing, customer: customerFollowing } = await this.getVideosFollowing(input);
            let videos = [...publicVideos, ...videosFollowing];
            const uniqueVideoIds = new Set<string>();
            videos = videos.filter(video => {
                const isUnique = !uniqueVideoIds.has(video.id);
                uniqueVideoIds.add(video.id);
                return isUnique;
            });
            const customer = await this.customerService.getUser(input);
            return { videos, customer, video: null };
        } catch (error) {
            console.error(`Error in getVideos: ${error.message}`);
            throw new HttpException('Error in getVideos.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getVideosHashTag(input) {
        try {
            return await this.repo.createQueryBuilder('video')
                .where('video.who = :who', { who: 'Public' })
                .orderBy('video.createdAt', 'ASC')
                .leftJoinAndSelect('video.user', 'user')
                .leftJoinAndSelect('video.likers', 'likers')
                .leftJoinAndSelect('video.comments', 'comments')
                .leftJoinAndSelect('comments.video', 'video2')
                .leftJoinAndSelect('comments.customer', 'customer')
                .innerJoin('video.hashtags', 'hashtag', 'hashtag.name = :nameHashTag', { nameHashTag: input.nameHashTag })
                .getMany()
            // const { videos: videosFollowing, customer: customerFollowing } = await this.getVideosFollowing(input);
            // let videos = [...publicVideos, ...videosFollowing];
            // const customer = await this.customerService.getUser(input);
            // return { videos, customer, video: null };
        } catch (error) {
            console.error(`Error in getVideos: ${error.message}`);
            throw new HttpException('Error in getVideos.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getVideosFollowing(input) {
        try {
            const customer = await this.customerService.getUserWithFollowingVideos(input);
            const followingUsers = customer.following;
            let videos = [];
            for (const user of followingUsers) {
                const foundVideo = user.videos.find(video => video.who === 'Public' || (video.who === 'Friends' && this.areFriends(customer.id, user.following)));
                if (foundVideo) {
                    videos.push(foundVideo);
                }
            }
            return { videos, customer, video: null };
        } catch (error) {
            console.error('Error in getVideosFollowing:', error);
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async getVideosFriends(input) {
        try {
            const customer = await this.customerService.getUserWithFollowingVideos(input);

            const friendVideos = customer.following
                .filter((user) => this.areFriends(customer.id, user.following))
                .map((user) => user.videos.find((video) => video.who === "Public" || video.who === "Friends"))
                .filter((video) => video !== undefined);

            return { videos: friendVideos, customer, video: null };
        } catch (error) {
            console.error('Error in getVideosFollowing:', error);
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getVideoById(input) {
        try {
            const { videos, customer } = await this.getVideos(input)
            let video = await this.repo.createQueryBuilder('video')
                .where('video.id  = :id', { id: input.videoId })
                .orderBy('video.createdAt', 'DESC')
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
            throw new HttpException(`Failed: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getVideo(input) {
        const video = await this.repo.createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .leftJoinAndSelect('video.comments', 'comments')
            .leftJoinAndSelect('video.hashtags', 'hashtags')
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
            await this.notificationService.delete(input.videoId)
            await this.repo.remove(video)
            return await this.firebaseConfig.firebaseAdmin.firestore().runTransaction(async () => {
                await Promise.all([
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`thumbnails/${video.name}`).delete(),
                    this.firebaseConfig.firebaseAdmin.storage().bucket().file(`videos/${video.name}`).delete()
                ])
            })
        } else {
            throw new HttpException('Failed delete', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

}