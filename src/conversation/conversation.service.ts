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
        try {
            const isExistConversation = await this.repo.createQueryBuilder('conversation')
                .where('(conversation.user_id = :user_id AND conversation.participant_id = :participant_id) OR (conversation.user_id = :inverse_user_id AND conversation.participant_id = :inverse_participant_id)',
                    {
                        user_id: input.senderId,
                        participant_id: input.receiverId,
                        inverse_user_id: input.receiverId,
                        inverse_participant_id: input.senderId
                    })
                .getOne();

            let conversation;
            if (!isExistConversation) {
                conversation = await this.repo.save(this.repo.create({ user_id: input.senderId, participant_id: input.receiverId }));
            } else {
                isExistConversation.count++
                conversation = await this.repo.save(isExistConversation);
            }

            input.conversationId = conversation.id;

            return await this.messageService.createMessage(input);
        } catch (error) {
            console.error(`Failed to create or update conversation: ${error}`);
            throw error;
        }
    }

    async getListContact(input) {
        try {
            return await this.repo.createQueryBuilder('conversation')
                .where('conversation.user_id = :user_id', { user_id: input.id })
                .orWhere('conversation.participant_id = :participant_id', { participant_id: input.id })
                .leftJoinAndSelect('conversation.user_id', 'user')
                .leftJoinAndSelect('conversation.participant_id', 'participant')
                .leftJoinAndSelect('conversation.messages', 'messages')
                .orderBy('conversation.updatedAt', 'DESC')
                .getMany();
        } catch (error) {
            console.error(`Failed to get contact list: ${error}`);
            throw error;
        }
    }

    async readMessage(input) {
        try {
            let conversation = await this.repo
                .createQueryBuilder('conversation')
                .where('conversation.id = :id', { id: input.conversationId })
                .leftJoinAndSelect('conversation.user_id', 'user')
                .leftJoinAndSelect('conversation.participant_id', 'participant')
                .leftJoinAndSelect('conversation.messages', 'messages')
                .orderBy('messages.createdAt', 'ASC')
                .getOne();
            if (conversation && conversation.messages && conversation.messages.length > 0) {
                if (conversation.messages[conversation.messages.length - 1].user_id !== input.id) {
                    conversation.messages[conversation.messages.length - 1].status = input.id;
                    await this.repo.save(conversation);
                }

            } else {
                throw new Error('Conversation not found or no messages in the conversation');
            }
        } catch (error) {
            console.error(`Failed to read message: ${error}`);
            throw error;
        }
    }

    async getContact(input) {
        try {
            return await this.repo.createQueryBuilder('conversation')
                .where('conversation.user_id = :user_id', { user_id: input.id })
                .orWhere('conversation.participant_id = :participant_id', { participant_id: input.id })
                .leftJoinAndSelect('conversation.user_id', 'user')
                .leftJoinAndSelect('conversation.participant_id', 'participant')
                .leftJoinAndSelect('conversation.messages', 'messages')
                .orderBy('conversation.updatedAt', 'DESC')
                .getOne();
        } catch (error) {
            console.error(`Failed to get contact: ${error}`);
            throw error;
        }
    }
}