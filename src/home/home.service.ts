import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/contact/contact.service';
import { ProductService } from 'src/product/product.service';
import { Repository } from 'typeorm';
import { Home } from './home.entity';
import { HomeType, InputSetHome } from './home.model';
import * as _ from 'lodash';

@Injectable()
export class HomeService extends BaseService<Home> {
  constructor(
    @InjectRepository(Home) repo: Repository<Home>,
    private contactService: ContactService,
    private productService: ProductService,
  ) {
    super(repo);
  }

  get() {
    return this.repo.findOne();
  }

  async getHome(): Promise<HomeType> {
    const [home, contact, products] = await Promise.all([
      this.findById('1'),
      this.contactService.get(),
      this.productService.getAll({ relations: ['projects'] }),
    ]);

    return { home, contact, products };
  }

  async update(input: InputSetHome): Promise<Home> {
    const homeData = await this.findById('1');

    _.forEach(input, (value, key) => {
      if (key !== 'id') value && (homeData[key] = value);
    });

    return this.repo.save(homeData);
  }
}
