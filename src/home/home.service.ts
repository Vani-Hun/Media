import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/contact/contact.service';
import { Repository } from 'typeorm';
import { Home } from './home.entity';
import { HomeType, InputSetHome } from './home.model';
import * as _ from 'lodash';

@Injectable()
export class HomeService extends BaseService<Home> {
  constructor(
    @InjectRepository(Home) repo: Repository<Home>,
    private contactService: ContactService,
  ) {
    super(repo);
  }

  get() {
    return this.repo.findOne();
  }

  async getHome(): Promise<HomeType> {
    const [home, contact] = await Promise.all([

      this.findById('1'),
      this.contactService.get(),
    ]);
    console.log("home:", home)
    console.log("contact:", contact)
    return { home, contact };
  }

  async update(input: InputSetHome): Promise<Home> {
    const homeData = await this.findById('1');

    _.forEach(input, (value, key) => {
      if (key !== 'id') value && (homeData[key] = value);
    });

    return this.repo.save(homeData);
  }
}
