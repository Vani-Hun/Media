import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
    ) { }

    async likeComment(commentId: string): Promise<Comment> {
        const comment = await this.commentRepository.findOne(commentId);
        if (!comment) {
            throw new NotFoundException('Comment not found');
        }

        comment.likes += 1;
        return this.commentRepository.save(comment);
    }

    async addReplyToComment(commentId: string, content: string): Promise<Comment> {
        const parentComment = await this.commentRepository.findOne(commentId, { relations: ['replies'] });
        if (!parentComment) {
            throw new NotFoundException('Parent comment not found');
        }

        const reply = new Comment();
        reply.content = content;
        reply.parent = parentComment;

        parentComment.replies.push(reply);
        await this.commentRepository.save(parentComment);
        return reply;
    }
}
