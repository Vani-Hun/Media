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

    async post(video, userId, type: NotificationType): Promise<Notification | {}> {
        try {
            const existingNotification = await this.repo
                .createQueryBuilder('notification')
                .where('notification.video = :id', { id: video.id })
                .andWhere('notification.type = :type', { type: type })
                .andWhere('notification.interactingUser = :interactingUser', { interactingUser: userId })
                .getOne();

            if (!existingNotification) {
                const newNotification = this.repo.create({
                    user: video.user.id,
                    interactingUser: userId,
                    video: video.id,
                    message: 'liked your video.',
                    status: false,
                    type: type,
                });

                const savedNotification = await this.repo.save(newNotification);
                return savedNotification;
            } else {
                return {};
            }
        } catch (error) {
            throw new HttpException(`Failed to create notification: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    get() {
        // return this.repo.findOne();
    }

}
