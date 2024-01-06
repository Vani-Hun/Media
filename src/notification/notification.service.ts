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
            if (input.type === 'Likes') {
                const existingNotification = await this.repo
                    .createQueryBuilder('notification')
                    .where('notification.video = :id', { id: input.video.id })
                    .andWhere('notification.type = :type', { type: 'Likes' })
                    .andWhere('notification.interactingUser = :interactingUser', { interactingUser: input.user.id })
                    .getOne();
                if (!existingNotification) {
                    const newNotification = this.repo.create({
                        user: input.video.user.id,
                        interactingUser: input.user.id,
                        video: input.video.id,
                        message: input.mess,
                        status: false,
                        type: input.type,
                    });

                    const savedNotification = await this.repo.save(newNotification);
                    return savedNotification
                } else {
                    return {};
                }
            } else {
                const newNotification = this.repo.create({
                    user: input.video.user.id,
                    interactingUser: input.user.id,
                    video: input.video.id,
                    message: input.mess,
                    status: false,
                    type: input.type,
                });

                const savedNotification = await this.repo.save(newNotification);
                return savedNotification
            }
        } catch (error) {
            throw new HttpException(`Failed to create notification: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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
