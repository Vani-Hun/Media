import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Hashtag } from './hashtag.entity';
import { error } from 'console';
import { CustomerService } from 'src/customer/customer.service';
import { VideoService } from 'src/video/video.service';
@Injectable()
export class HashtagService extends BaseService<Hashtag> {
    constructor(
        @InjectRepository(Hashtag) repo: Repository<Hashtag>,
        @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService,
        @Inject(forwardRef(() => VideoService)) private videoService: VideoService,
    ) {
        super(repo);
    }

    async getHashTags(input) {
        return await this.repo.createQueryBuilder('hashtag')
            .where('hashtag.name LIKE :name', { name: `%${input.nameHashTag}%` })
            .orderBy('hashtag.usage', 'DESC')
            .getMany()
    }

    async getHashTagVideos(input) {
        const videos = await this.videoService.getVideosHashTag(input)

        const customer = await this.customerService.getUser(input);
        return { videos, customer, video: null, cursor: null };
    }

    async getHashTag(input) {

        let hashtag = await this.repo.createQueryBuilder('hashtag')
            .where('hashtag.name = :name', { name: input.nameHashTag })
            .getOne();

        if (hashtag) {
            hashtag.usage++;
            await this.repo.save(hashtag);
        } else {
            hashtag = this.repo.create({ name: input.nameHashTag, usage: 1 });
            await this.repo.save(hashtag);
        }
        return hashtag;
    }

}