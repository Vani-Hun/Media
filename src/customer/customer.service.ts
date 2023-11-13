import { forwardRef, Inject, Injectable, UnauthorizedException, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { ContactService } from 'src/contact/contact.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { InputSetCustomer, InputSetAuth } from './customer.model';
import * as _ from 'lodash';
import { Response } from 'express';
import { access } from 'fs';
import { VideoService } from 'src/video/video.service';
import { TokenService } from 'src/common/services/token.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { createReadStream, createWriteStream, existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(@Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
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
  async getVideoById(videoId) {
    const video = await this.videoService.getVideoById(videoId)
    return { video }
  }

  async getVideo() {
    const videos = await this.videoService.get()
    return { videos }
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
    // const url = await this.uploadFile(user)

    const data = readFileSync(user.avatar.path);
    const fileBuffer = Buffer.from(data);
    const filePath = `avatars/${user.user.id}`;
    const file = this.firebaseConfig.bucket.file(filePath);


    const [fileExists] = await file.exists();
    if (fileExists) {
      await file.delete();
      console.log(`Đã xóa tệp tin tồn tại: ${filePath}`);
    }
    await file.save(fileBuffer, {
      metadata: {
        contentType: user.avatar.mimetype,
      },
    });
    await this.clearTmp(user.avatar.path);
    const fileRef = await getStorage().bucket(`${this.firebaseConfig.bucket.name}`).file(`${file.name}`);
    const downloadURL = await getDownloadURL(fileRef);

    const updateData = {
      /* Các trường dữ liệu bạn muốn cập nhật, ví dụ: */
      logo: downloadURL,
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
    const url = await this.videoService.uploadVideo(input)
    if (url) {
      return await this.videoService.create(url, input)
    }
  }

  async upDateVideo(input) {
    const saveVideo = await this.videoService.update(input)
    return true
  }

  async deleteVideo(video, user) {
    return await this.videoService.delete(video, user)

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
