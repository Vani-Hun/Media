import { forwardRef, Inject, Injectable, UnauthorizedException, Res, Render } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Video } from '../video/video.entity';
import { Comment } from '../comment/comment.entity';
import { InputSetCustomer, InputSetAuth } from './customer.model';
import * as _ from 'lodash';
import { VideoService } from 'src/video/video.service';
import { TokenService } from 'src/common/services/token.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { readFileSync } from 'fs';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
    @InjectRepository(Customer) repo: Repository<Customer>,
    private tokenService: TokenService,
    private videoService: VideoService,
    private commentService: CommentService
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

  async googleLogin(input, res) {
    const data = await this.repo.findOne({
      where: { email: input.emails[0].value }
    })
    if (!data) {
      const userCreate = {
        logo: input.photos[0].value,
        email: input.emails[0].value,
        name: input.name.givenName + " " + input.name.familyName,
        username: "user" + input.name.givenName,
        password: null
      }
      const user = await this.signUp(userCreate)
      const payload = {
        id: user.id,
        username: user.username,
        name: user.name
      };
      const sign = this.tokenService.sign(payload)
      return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    } else {
      const payload = {
        id: data.id,
        username: data.username,
        name: data.name
      };
      const sign = this.tokenService.sign(payload)
      return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    }
  };

  async facebookLogin(input, res) {
    console.log("input:", input)
    const data = await this.repo.findOne({
      where: { email: input.id }
    })
    if (!data) {
      const userCreate = {
        logo: input.photos[0].value,
        email: input.id,
        name: input.displayName,
        username: "user" + input.displayName,
        password: null
      }
      const user = await this.signUp(userCreate)
      const payload = {
        id: user.id,
        username: user.username,
        name: user.name
      };
      const sign = this.tokenService.sign(payload)
      return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    } else {
      const payload = {
        id: data.id,
        username: data.username,
        name: data.name
      };
      const sign = this.tokenService.sign(payload)
      return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    }
  }

  async signUp(input: InputSetAuth) {
    const data = await this.repo.findOne({
      where: [{ username: input.username }, { email: input.username }]
    })
    if (!data) {
      const createUser = this.repo.save(this.repo.create({ ...input }))
      return createUser
    }
    console.log(new UnauthorizedException('Your username is exist!!'))
    throw new UnauthorizedException('Your username is exist!!');

  }

  async get(input: InputSetCustomer) {
    const customer = await this.repo.findOneOrFail(input.id)
    return { customer }
  }
  async getVideoById(videoId, userId) {
    const customer = await this.repo.findOneOrFail(userId)
    const video = await this.videoService.getVideoById(videoId)
    return { video, customer }
  }

  async getVideo(userId) {
    const videos = await this.videoService.get()
    const customer = await this.repo.findOneOrFail(userId);
    const likedVideoIds = videos
      .filter(video => video.likers.some(liker => liker.id === userId))
      .map(video => video.id);
    return { videos, likedVideoIds, customer }
  }

  async getVideoLiked(userId) {
    const customer = await this.repo.findOneOrFail(userId, { relations: ['likedVideos', 'likedVideos.comments', 'likedVideos.likers', 'likedVideos.comments.customer'] });
    return { customer }
  }
  async likeVideo(input) {
    const customer = await this.repo.findOneOrFail(input.user.id, { relations: ['likedVideos'] });
    const newVideo = new Video();
    newVideo.id = input.videoId;
    customer.likedVideos.push(newVideo);
    await this.repo.save(customer);
    return await this.videoService.updateLike(input)
  }

  async shareVideo(input) {
    return await this.videoService.updateShare(input)
  }
  async dislikeVideo(input) {
    const customer = await this.repo.findOneOrFail(input.user.id, { relations: ['likedVideos'] });

    customer.likedVideos = customer.likedVideos.filter(likedVideo => likedVideo.id !== input.videoId);

    await this.repo.save(customer);
    return await this.videoService.updateDisLike(input)
  }

  async commentVideo(input) {
    return await this.commentService.create(input)
  }

  async getProfile(user) {
    const customer = await this.repo.findOneOrFail(user.id, { relations: ['videos', 'videos.comments', 'videos.likers'] });
    // Sắp xếp các video trong mảng videos của customer
    customer.videos = customer.videos.sort((a, b) => {
      if (a.updateAt > b.updateAt) return -1;
      if (a.updateAt < b.updateAt) return 1;
      return 0;
    });
    return { customer }
  }

  async getViewProfile(user, customerId, res) {
    const customer = await this.repo.findOneOrFail(customerId, { relations: ['videos', 'videos.user', 'videos.comments', 'videos.likers'] });
    // Sắp xếp các video trong mảng videos của customer
    customer.videos = customer.videos.sort((a, b) => {
      if (a.updateAt > b.updateAt) return -1;
      if (a.updateAt < b.updateAt) return 1;
      return 0;
    });
    if (user.id === customer.id) {
      return res.render('customer/profile', { customer })
    } else { return res.render('customer/viewProfile', { customer }) }
  }

  async postProfile(user) {
    let downloadURL;
    let updateData;
    // const url = await this.uploadFile(user)
    if (user.avatar) {
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
      downloadURL = await getDownloadURL(fileRef);
      updateData = {
        /* Các trường dữ liệu bạn muốn cập nhật, ví dụ: */
        logo: downloadURL,
        username: user.username,
        name: user.name,
        bio: user.bio
      };
    } else {
      updateData = {
        username: user.username,
        name: user.name,
        bio: user.bio
      };
    }
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
    await this.commentService.delete(video, user)
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
