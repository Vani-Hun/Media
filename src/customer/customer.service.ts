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
        return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
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

  async get(input: InputSetCustomer) {
    const customer = await this.findById(input.id)
    return { customer }
  }
  async getVideo() {
    const video = await this.videoService.get()
    console.log("video:", video)
    const loadVideo = await this.loadVideo()
    console.log("loadVideo:", loadVideo)
    return
  }

  async getProfile(user) {
    const customer = await this.repo.findOneOrFail(user.id, { relations: ['videos'] });
    // Sắp xếp các video trong mảng videos của customer
    customer.videos = customer.videos.sort((a, b) => {
      if (a.updateAt > b.updateAt) return -1;
      if (a.updateAt < b.updateAt) return 1;
      return 0;
    });
    return { customer }
  }

  async postProfile(user) {
    const url = await this.uploadFile(user)
    const updateData = {
      /* Các trường dữ liệu bạn muốn cập nhật, ví dụ: */
      logo: url,
      username: user.username,
      name: user.name,
      bio: user.bio
    };
    const customer = await this.repo.update({ id: user.user.id }, updateData)
    return { customer }
  }
  getAll() {
    return this.repo.find();
  }

  async upVideo(input) {
    const url = await this.uploadVideo(input)
    if (url) {
      const saveVideo = await this.videoService.create(url, input)
      return true
    }
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
