import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InputGetRequest, InputSetProduct } from './product.model';
import { Product } from './product.entity';
import * as _ from 'lodash';
import { ContactService } from 'src/contact/contact.service';
import { ProjectService } from '../project/project.service';
import { AboutUsService } from 'src/aboutUs/aboutUs.service';

@Injectable()
export class ProductService extends BaseService<Product> {
  constructor(
    @InjectRepository(Product) repo: Repository<Product>,
    private contactService: ContactService,
    private projectService: ProjectService,
    @Inject(forwardRef(() => AboutUsService))
    private aboutUsService: AboutUsService,
  ) {
    super(repo);
  }

  async getRequest(input?: InputGetRequest) {
    const [products, contact] = await Promise.all([
      this.getAll({ relations: ['projects'] }),
      this.contactService.get(),
    ]);

    let index = 0;
    if (input && input.productID) {
      let product: Product;
      _.forEach(products, (value, i) => {
        if (value.id.toString() === input.productID) {
          index = i;
          product = value;
          return;
        }
      });

      if (input.projectID) {
        const check = _.some(product.projects, [
          'id',
          parseInt(input.projectID),
        ]);

        if (check) {
          const project = await this.projectService.getOne(input.projectID, {
            relations: ['product'],
          });

          return { project, products, contact, index };
        } else throw new BadRequestException('this');
      }
    }

    return { products, contact, index };
  }

  getOne(id: string, options?: FindOneOptions<Product>) {
    return this.findById(id, options);
  }

  getAll(options?: FindManyOptions<Product>) {
    return this.repo.find(options);
  }

  async create(input: InputSetProduct) {
    const aboutUs = await this.aboutUsService.get();
    const banner = input.banner
      ? this.handleUploadFile(input.banner, 'img/product/banner', [
          'png',
          'jpg',
          'webp',
        ])
      : null;
    const product = this.repo.create({
      ...input,
      banner,
      aboutUs,
    });
    return this.repo.save(product);
  }

  async update(input: InputSetProduct) {
    const product = await this.findById(input.id);
    const banner = input.banner
      ? this.handleUploadFile(
          input.banner,
          'img/product/banner',
          ['png', 'jpg', 'webp'],
          product.banner,
        )
      : product.banner;
    _.forEach(input, (value, key) => {
      if (key === 'banner') product.banner = banner;
      else if (key !== 'id') value && (product[key] = value);
    });

    return this.repo.save(product);
  }

  async delete(id: string) {
    const product = await this.findById(id);
    product.banner && this.clearFile(product.banner);
    return !!(await this.repo.delete(id));
  }
}
