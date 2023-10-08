import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { InputSetContact } from './contact.model';
import * as _ from 'lodash';

@Injectable()
export class ContactService extends BaseService<Contact> {
  constructor(@InjectRepository(Contact) contactRepo: Repository<Contact>) {
    super(contactRepo);
  }

  get(options?: FindOneOptions<Contact>): Promise<Contact> {
    return this.repo.findOne(options);
  }

  async update(input: InputSetContact) {
    const contact = await this.repo.findOne();

    _.forEach(input, (value, key) => {
      (contact[key] = value);
    });

    return this.repo.save(contact);
  }
}
