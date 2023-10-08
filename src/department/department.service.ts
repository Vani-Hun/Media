import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InputSetDepartment } from './department.model';
import { AboutUsService } from '../aboutUs/aboutUs.service';
import { Department } from './department.entity';
import * as _ from 'lodash';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @InjectRepository(Department) repo: Repository<Department>,
    private aboutUsService: AboutUsService,
  ) {
    super(repo);
  }

  getAll(options?: FindManyOptions<Department>) {
    return this.repo.find(options);
  }

  get(id: string, options?: FindOneOptions<Department>) {
    return this.findById(id, options);
  }

  async create(input: InputSetDepartment) {
    const aboutUs = await this.aboutUsService.get();
    const logo = input.logo
      ? this.handleUploadFile(input.logo, 'img/department/logo', [
        'png',
        'jpg',
        'webp',
      ])
      : null;

    const department = this.repo.create({ ...input, aboutUs, logo });

    return this.repo.save(department);
  }

  async update(input: InputSetDepartment) {
    const department = await this.findById(input.id);
    const logo = input.logo
      ? this.handleUploadFile(
        input.logo,
        'img/department/logo',
        ['png', 'jpg', 'webp'],
        department.logo,
      )
      : department.logo;

    _.forEach(input, (value, key) => {
      if (key === 'logo') department.logo = logo;
      else if (value && key !== 'id') department[key] = value;
    });

    return this.repo.save(department);
  }

  async delete(id: string) {
    const department = await this.findById(id);
    department.logo && this.clearFile(department.logo);
    return !!(await this.repo.delete(id));
  }
}
