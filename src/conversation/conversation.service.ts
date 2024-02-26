import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Customer } from 'src/customer/customer.entity';
import { createReadStream } from 'fs';
import { Comment } from 'src/comment/comment.entity';
import { error } from 'console';
import { CustomerService } from 'src/customer/customer.service';
import { CommentService } from 'src/comment/comment.service';
import { NotificationService } from 'src/notification/notification.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { NotificationMess, NotificationType } from 'src/notification/notitfication.entity';
import { Conversation } from './conversation.entity';
@Injectable()
export class ConversationService extends BaseService<Conversation> {
    constructor(@Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
        @InjectRepository(Conversation) repo: Repository<Conversation>,
        @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService,
        private notificationService: NotificationService
    ) {
        super(repo);
    }
    async getPage(input) {
        const customer = await this.customerService.getUser(input)
        return { customer }
    }

}