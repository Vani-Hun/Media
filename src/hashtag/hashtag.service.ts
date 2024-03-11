import { HttpException, Injectable, UnauthorizedException, Inject, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Hashtag } from './hashtag.entity';
import { error } from 'console';
import { CustomerService } from 'src/customer/customer.service';
@Injectable()
export class HashtagService extends BaseService<Hashtag> {
    constructor(
        @InjectRepository(Hashtag) repo: Repository<Hashtag>,
        @Inject(forwardRef(() => CustomerService)) private customerService: CustomerService,
    ) {
        super(repo);
    }

    async getHashTag(input) {
        return await this.repo.createQueryBuilder('hashtag')
            .where('hashtag.name LIKE :name', { name: `%${input.nameHashTag}%` })
            .orderBy('hashtag.usage', 'DESC')
            .getMany()
    }
}