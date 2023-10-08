import { Controller, Post, Param, Body } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Post(':commentId/like')
    async likeComment(@Param('commentId') commentId: string) {
        return this.commentService.likeComment(commentId);
    }

    @Post(':commentId/reply')
    async addReplyToComment(@Param('commentId') commentId: string, @Body() data: { content: string }) {
        return this.commentService.addReplyToComment(commentId, data.content);
    }
}
