import { MessageService } from './../message/message.service';
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
        private notificationService: NotificationService,
        private messageService: MessageService
    ) {
        super(repo);
    }
    async createConversation(input) {
        const isExistConversation = await this.repo.createQueryBuilder('conversation')
            .where('conversation.user_id = :user_id', { user_id: input.senderId })
            .andWhere('conversation.participant_id = :participant_id', { participant_id: input.receiverId })
            .getOne()

        if (!isExistConversation) {
            const conversation = await this.repo.save(this.repo.create({ user_id: input.senderId, participant_id: input.receiverId }))
            input.conversationId = await conversation.id;
        } else {
            isExistConversation.count++
            await this.repo.save(isExistConversation)
            input.conversationId = await isExistConversation.id;
        }
        return await this.messageService.createMessage(input)
    }

    async getList(input) {
        return await this.repo.createQueryBuilder('conversation')
            .where('conversation.user_id = :user_id', { user_id: input.id })
            .orWhere('conversation.participant_id = :participant_id', { participant_id: input.id })
            .leftJoinAndSelect('conversation.user_id', 'user_id')
            .leftJoinAndSelect('conversation.participant_id', 'participant_id')
            .leftJoinAndSelect('conversation.messages', 'messages')
            .orderBy('conversation.updateAt', 'DESC')
            .getMany()
    }

}