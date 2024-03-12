import { Notification, NotificationType } from './notitfication.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Video } from 'src/video/video.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService extends BaseService<Notification> {
    constructor(
        @InjectRepository(Notification) repo: Repository<Notification>,
    ) {
        super(repo);
    }

    async createNotification(input): Promise<Notification | {}> {
        try {
            if (input.type === 'Likes' || input.type === 'Followers') {
                const existingLikesAndFollowersNotification = await this.repo
                    .createQueryBuilder('notification')
                    .where('(notification.video = :videoId AND notification.type = :likesType) OR (notification.type = :followersType)')
                    .andWhere('notification.interactingUser = :interactingUser', { videoId: input.video ? input.video.id : null, likesType: 'Likes', followersType: 'Followers', interactingUser: input.id })
                    .getMany();

                if (existingLikesAndFollowersNotification.length > 1) {
                    return {};
                } else {
                    const newNotification = this.repo.create({
                        user: input.video && input.video.user ? input.video.user.id : input.customerId,
                        interactingUser: input.id,
                        video: input.video ? input.video.id : null,
                        message: input.mess,
                        status: false,
                        type: input.type,
                    });

                    return await this.repo.save(newNotification);
                }
            }
            if (input.type === 'Mention and tags') {
                const newNotification = this.repo.create({
                    user: input.mention,
                    interactingUser: input.video.user,
                    video: input.video ? input.video.id : null,
                    message: input.mess,
                    status: false,
                    type: input.type,
                });

                return await this.repo.save(newNotification);
            }

        } catch (error) {
            throw new HttpException(`Failed to create notification: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteNotification(input) {
        try {
            const existingNotification = await this.repo
                .createQueryBuilder('notification')
                .where('(notification.video = :videoId AND notification.type = :likesType) OR (notification.type = :followersType AND notification.video IS NULL)')
                .andWhere('notification.interactingUser = :interactingUser', { videoId: input.video ? input.video.id : null, likesType: 'Likes', followersType: 'Followers', interactingUser: input.id })
                .getOne();
            if (!existingNotification) {
                return {}
            }
            return await this.repo.remove(existingNotification)
        } catch (error) {
            throw new HttpException(`Failed to delete notification: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async checkNotification(userId: string) {
        return await this.repo
            .createQueryBuilder('notification')
            .update()
            .set({ status: true })
            .where('notification.user = :user', { user: userId })
            .andWhere('notification.status = :status', { status: false })
            .execute();
    }
    get() {
        // return this.repo.findOne();
    }

}
