import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AboutUsService } from 'src/aboutUs/aboutUs.service';
import { BaseService } from 'src/common/services/base.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Personnel } from './personnel.entity';
import { InputSetPersonnel } from './personnel.model';
import * as _ from 'lodash';

@Injectable()
export class PersonnelService extends BaseService<Personnel> {
  constructor(
    @InjectRepository(Personnel) repo: Repository<Personnel>,
    private aboutUsService: AboutUsService,
  ) {
    super(repo);
  }

  get(id: string, options?: FindOneOptions<Personnel>) {
    return this.findById(id, options);
  }

  getAll(options?: FindManyOptions<Personnel>) {
    return this.repo.find(options);
  }

  async create(input: InputSetPersonnel) {
    const aboutUs = await this.aboutUsService.get();

    const img = input.img
      ? this.handleUploadFile(input.img, 'img/personnel/img', [
          'png',
          'jpg',
          'webp',
        ])
      : null;

    const personnel = this.repo.create({
      ...input,
      aboutUs,
      img,
      bio: Array.isArray(input.bio)
        ? input.bio.join('|').replace(/(\|{2,})|(^\|)|(\|$)/g, '')
        : input.bio,
    });

    return this.repo.save(personnel);
  }

  async update(input: InputSetPersonnel) {
    const personnel = await this.findById(input.id);
    const img = input.img
      ? this.handleUploadFile(
          input.img,
          'img/personnel/img',
          ['png', 'jpg', 'webp'],
          personnel.img,
        )
      : personnel.img;

    _.forEach(input, (value, key) => {
      if (value && key === 'bio')
        personnel.bio = value.join('|').replace(/(\|{2,})|(^\|)|(\|$)/g, '');
      else if (key === 'img') personnel.img = img;
      else if (key !== 'id') value && (personnel[key] = value);
    });

    return this.repo.save(personnel);
  }

  async delete(id: string) {
    const personnel = await this.findById(id);
    personnel.img && this.clearFile(personnel.img);
    return !!(await this.repo.delete(id));
  }
}
