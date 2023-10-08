import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { AboutUs } from './aboutUs.entity';
import * as _ from 'lodash';
import { ContactService } from 'src/contact/contact.service';
import { ProductService } from 'src/product/product.service';
import { InputSetAboutUs } from './aboutUs.model';

@Injectable()
export class AboutUsService extends BaseService<AboutUs> {
  constructor(
    @InjectRepository(AboutUs) aboutUsRepo: Repository<AboutUs>,
    private contactService: ContactService,
    @Inject(forwardRef(() => ProductService))
    private categoryService: ProductService,
  ) {
    super(aboutUsRepo);
  }

  async get(options?: FindOneOptions<AboutUs>) {
    const aboutUs = await this.repo.findOne(options);
    _.forEach(aboutUs, (value, key) => {
      key === 'goals' && (aboutUs[key] = value.split('|'));
      key === 'values' && (aboutUs[key] = value.replace(/\|/g, ', '));
    });

    return aboutUs;
  }

  async getPage(options?: FindOneOptions<AboutUs>) {
    const [aboutUs, contact, products] = await Promise.all([
      this.get(options),
      this.contactService.get(),
      this.categoryService.getAll(),
    ]);

    return { aboutUs, contact, products };
  }

  async update(input: InputSetAboutUs) {
    const aboutUs = await this.repo.findOne();

    _.forEach(input, (value, key) => {
      if (value && (key === 'goals' || key === 'values')) {
        const content = value.join('|');
        aboutUs[key] = content.replace(/(\|{2,})|(^\|)|(\|$)/g, '');
      } else if (key !== 'id') aboutUs[key] = value;
    });

    return this.repo.save(aboutUs);
  }
}
