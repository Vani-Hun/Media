import { Notification } from './notitfication.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService extends BaseService<Notification> {
    constructor(
        @InjectRepository(Notification) repo: Repository<Notification>,
    ) {
        super(repo);
    }

    async post(video, userId, type) {
        try {
            const notification = await this.repo.create({
                user: video.user.id,
                interactingUser: userId,
                message: "HAHA",
                status: Boolean(false),
                type: type,
            });
            return await this.repo.save(notification);
        } catch (error) {
            throw new HttpException(`Failed to create video: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    get() {
        // return this.repo.findOne();
    }

}
