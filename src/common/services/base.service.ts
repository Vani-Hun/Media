import { NotFoundException } from '@nestjs/common';
import { DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { UtilService } from './util.service';

export class BaseService<T> extends UtilService {
  constructor(protected repo: Repository<T>) {
    super();
  }

  protected async findById(id?: string, options?: FindOneOptions<T>,): Promise<T> {
    let result: T;

    // if (options) {
    //   result = await this.repo.findOne(id, options);
    //   console.log("result:", result)
    // } else {
    //   result = await this.repo.findOne(id);
    // }

    if (!result) {
      throw new NotFoundException(`Data with id = ${id} does not exist`);
    }

    return result;
  }

  protected async deleteOneById(id: string): Promise<DeleteResult> {
    await this.findById(id);
    return this.repo.delete(id);
  }
}
