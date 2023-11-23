import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class CommentService {
    constructor(@InjectRepository(Comment) private readonly repo: Repository<Comment>) { }
    async create(input) {
        console.log("input:", input)
        const createData = await this.repo.create({ text: input.mess, customer: input.user.id, video: input.videoId })
        return await this.repo.save(createData)
    }
    async delete(video, user) {
        return await this.repo.delete({ video: video });
    }

}
