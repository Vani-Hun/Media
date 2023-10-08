import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Project } from './project.entity';
import * as _ from 'lodash';
import { ProductService } from '../product/product.service';
import { InputSetProject } from './project.model';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project) repo: Repository<Project>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) {
    super(repo);
  }

  async getOne(id: string, option?: FindOneOptions<Project>) {
    const project = await this.findById(id, option);
    _.forEach(project, (value, key) => {
      !!(key === 'utility') && (project[key] = value.split('|'));
      !!(key === 'feature') && (project[key] = value.split('|'));
    });

    return project;
  }

  async getAll(options?: FindManyOptions<Project>) {
    const projects = await this.repo.find(options);

    _.forEach(projects, (project) => {
      !!project.utility && (project.utility = project.utility.split('|'));
      !!project.feature && (project.feature = project.feature.split('|'));
    });
    return projects;
  }

  async delete(id: string) {
    const project = await this.findById(id);
    project.banner && this.clearFile(project.banner);
    return !!(await this.repo.delete(id));
  }
}
