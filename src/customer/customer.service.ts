import { forwardRef, Inject, Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/contact/contact.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { InputSetCustomer, InputSetAuth } from './customer.model';
import * as _ from 'lodash';
import { TokenService } from 'src/common/services/token.service';
import { Response } from 'express';
import { access } from 'fs';
import { VideoService } from 'src/video/video.service';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @InjectRepository(Customer) repo: Repository<Customer>,
    private contactService: ContactService,
    private tokenService: TokenService,
    private videoService: VideoService
  ) {
    super(repo);
  }

  async signIn(input: InputSetAuth, res) {
    const data = await this.repo.findOne({
      where: { username: input.username }
    })
    if (!data) {
      throw new UnauthorizedException('Your username is not exist!!');
    } else {
      if (data.password !== input.password) {
        throw new UnauthorizedException('Your password is wrong!!');
      } else {
        const payload = {
          id: data.id,
          username: data.username,
          name: data.name
          // Thêm các thuộc tính khác nếu cần
        };
        const sign = this.tokenService.sign(payload)
        return res.cookie('accessToken', sign, { httpOnly: true });
      }
    }
  }
  async signUp(input: InputSetAuth) {
    const data = await this.repo.findOne({
      where: { username: input.username }
    })
    if (!data) {
      const createUser = this.repo.save(this.repo.create({ ...input }))
      return !!createUser
    }
    console.log(new UnauthorizedException('Your username is exist!!'))
    throw new UnauthorizedException('Your username is exist!!');

  }

  async get() {
    const contact = await this.contactService.get()
    return { contact }
  }
  async getVideo() {
    const video = await this.videoService.get()
    console.log("video:", video)
    return
  }
  getAll() {
    return this.repo.find();
  }

  create(input: InputSetCustomer) {
    const logo = input.logo
      ? this.handleUploadFile(input.logo, 'img/customer/logo', [
        'jpg',
        'png',
        'wepb',
      ])
      : null;

    const customer = this.repo.create({
      ...input,
      logo,
    });

    return this.repo.save(customer);
  }

  async uploadVideo(input) {
    const up = await this.uploadVani(input)
    console.log("up:", up)
    if (up) {
      await this.videoService.create(up, input)
      return true
    }


  }
  async update(input: InputSetCustomer) {
    const customer = await this.findById(input.id);
    const logo = input.logo
      ? this.handleUploadFile(
        input.logo,
        'img/customer/logo',
        ['jpg', 'png', 'webp'],
        customer.logo,
      )
      : customer.logo;

    _.forOwn(input, (value, key) => {
      if (key === 'logo') customer.logo = logo;
      else if (key !== 'id') customer[key] = value;
    });

    return this.repo.save(customer);
  }

  async delete(id: string) {
    const customer = await this.findById(id);
    customer.logo && this.clearFile(customer.logo);
    return !!(await this.repo.delete(id));
  }
  async isExist(input: Customer) {
    return !!(await this.findById(input.id));
  }
}
