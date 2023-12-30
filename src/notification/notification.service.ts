import { Notification } from './notitfication.entity';
import { Injectable } from '@nestjs/common';
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

    get() {
        // return this.repo.findOne();
    }

}
