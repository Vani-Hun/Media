import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Mailbox } from './mailbox.entity';

@Injectable()
export class MailboxService extends BaseService<Mailbox> {
    constructor(
        @InjectRepository(Mailbox) repo: Repository<Mailbox>
        ) {
        super(repo);
    }

    async get(){
        return await this.repo.findOne()
    }
}