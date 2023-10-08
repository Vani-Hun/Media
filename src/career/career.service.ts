import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/contact/contact.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Career } from './career.entity';

@Injectable()
export class CareerService extends BaseService<Career> {
    constructor(
        @InjectRepository(Career) repo: Repository<Career>,
        private contactService: ContactService) {
        super(repo);
    }

    async getContact(){
        return await this.contactService.get()
    }

    async get(id?: string,  option?: FindOneOptions<Career>) {
        return await this.repo.findOne(option)
    }

    async getAll(options?: FindManyOptions<Career>) {
        return await this.repo.find(options)
    }
}