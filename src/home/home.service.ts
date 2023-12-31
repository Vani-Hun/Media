import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Home } from './home.entity';
import { HomeType, InputSetHome } from './home.model';

@Injectable()
export class HomeService extends BaseService<Home> {
  constructor(
    @InjectRepository(Home) repo: Repository<Home>,
  ) {
    super(repo);
  }

  get() {
    // return this.repo.findOne();
  }

  // async getHome(): Promise<HomeType> {
  //   const home = await Promise.all([
  //     this.findById('1')
  //   ]);
  //   return { home };
  // }

  // async update(input: InputSetHome): Promise<Home> {
  //   const homeData = await this.findById('1');

  //   _.forEach(input, (value, key) => {
  //     if (key !== 'id') value && (homeData[key] = value);
  //   });

  //   return this.repo.save(homeData);
  // }
}
