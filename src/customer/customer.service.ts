import { forwardRef, Inject, Injectable, HttpException, UnauthorizedException, Res, Render, Redirect, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { Video } from '../video/video.entity';
import { Comment } from '../comment/comment.entity';
import { InputSetCustomer, InputSetAuth, InputSetCustomerActionVideo } from './customer.model';
import { VideoService } from 'src/video/video.service';
import { TokenService } from 'src/common/services/token.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { readFileSync } from 'fs';
import { CommentService } from 'src/comment/comment.service';
import * as bcrypt from 'bcrypt';
import { SmsService } from 'src/common/services/twilio.service';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
    @InjectRepository(Customer) repo: Repository<Customer>,
    private tokenService: TokenService,
    private videoService: VideoService,
    private commentService: CommentService,
    private smsService: SmsService
  ) {
    super(repo);
  }

  async signIn(input: InputSetAuth, res) {
    const existingUser = await this.repo.findOne({
      where: { username: input.username },
    });
    if (!existingUser) {
      throw new HttpException('Your username is not exist!!', HttpStatus.UNAUTHORIZED);
    }
    const isPasswordValid = await bcrypt.compare(input.password, existingUser.password);

    if (!isPasswordValid) {
      throw new HttpException('Your password is wrong!!', HttpStatus.UNAUTHORIZED);
    }
    const payload = {
      id: existingUser.id,
      username: existingUser.username,
      name: existingUser.name,
    };

    const sign = this.tokenService.sign(payload);
    return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
  }

  async googleLogin(input, res) {
    const existingUser = await this.repo.findOne({
      where: { email: input.emails[0].value }
    })
    if (!existingUser) {
      const userCreate = {
        logo: input.photos[0].value,
        email: input.emails[0].value,
        name: input.name.givenName + " " + input.name.familyName,
        username: "user" + input.name.givenName,
        password: null,
        phone: null
      }
      const user = await this.signUpOAuth2(userCreate)
      const payload = {
        id: user.id,
        username: user.username,
        name: user.name
      };
      const sign = this.tokenService.sign(payload)
      return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
    } else {
      const payload = {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name
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
        password: null,
        phone: null
      }
      const user = await this.signUpOAuth2(userCreate)
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

  async signUp(input: InputSetAuth, res) {
    console.log("input:", input)
    const existingUser = await this.repo.findOne({
      where: [{ username: input.username }, { email: input.username }],
    });

    if (!existingUser) {
      const otp = Math.floor(Math.random() * 1000000).toString()
      console.log("otp:", otp)
      const formattedPhoneNumber = `+84${input.phone.slice(1)}`;
      console.log("formattedPhoneNumber:", formattedPhoneNumber)
      await this.smsService.sendOtpViaSms(formattedPhoneNumber, otp);
      const hashedOTP = await bcrypt.hash(otp, 10);
      const hashedPassword = await bcrypt.hash(input.password, 10);
      res.cookie('username', input.username, { httpOnly: true, maxAge: 60 * 1000 })
      res.cookie('phone', input.phone, { httpOnly: true, maxAge: 60 * 1000 })
      res.cookie('hashedPassword', hashedPassword, { httpOnly: true, maxAge: 60 * 1000 })
      res.cookie('hashedOTP', hashedOTP, { httpOnly: true, maxAge: 60 * 1000 });
      return res.redirect('/customer/verify-otp');
    }
    throw new HttpException('Your username or email is already registered.', HttpStatus.CONFLICT);
  }

  async signUpOAuth2(input: InputSetAuth) {
    const existingUser = await this.repo.findOne({
      where: [{ username: input.username }, { email: input.username }],
    });

    if (!existingUser) {
      const createUser = this.repo.save(this.repo.create({ ...input }));
      return createUser;
    }
    throw new HttpException('Your username or email is already registered.', HttpStatus.CONFLICT);
  }

  async signUpVerify(input) {
    console.log("input:", input)
    if (input.otp && input.hashedOTP) {
      const compare = await bcrypt.compare(input.otp, input.hashedOTP);
      if (compare) {
        return this.repo.save(this.repo.create({ username: input.username, name: `user${input.username}`, password: input.hashedPassword, phone: input.phone }));
      } else {
        throw new HttpException('OTP not correct', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    } else {
      throw new HttpException('OTP is expired, please click cancel', HttpStatus.FORBIDDEN);
    }
  }

  async get(input) {
    const customer = await this.repo.findOneOrFail({ where: { id: input.id } });
    return { customer }
  }
  async getVideoById(videoId, userId) {
    const customer = await this.repo.findOneOrFail({ where: { id: userId } })
    const video = await this.videoService.getVideoById(videoId)
    return { video, customer }
  }

  async getVideo(userId) {
    const videos = await this.videoService.get()
    const customer = await this.repo.findOneOrFail({ where: { id: userId } });
    const likedVideoIds = videos
      .filter(video => video.likers.some(liker => liker.id === userId))
      .map(video => video.id);
    return { videos, likedVideoIds, customer }
  }

  async getVideoLiked(userId) {
    const customer = await this.repo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
      .leftJoinAndSelect('likedVideos.comments', 'comments')
      .leftJoinAndSelect('comments.customer', 'commentCustomer')
      .leftJoinAndSelect('likedVideos.likers', 'likers')
      .where('customer.id = :id', { id: userId })
      .getOneOrFail();

    return { customer }
  }

  async viewVideo(input) {
    const customer = await this.repo.findOneOrFail({ where: { id: input.user.id } });
    return await this.videoService.updateView(input, customer)
  }

  async likeVideo(input) {
    const customer = await this.repo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
      .leftJoinAndSelect('likedVideos.comments', 'comments')
      .where('customer.id = :id', { id: input.user.id })
      .getOneOrFail();
    const newVideo = new Video();
    newVideo.id = input.videoId;
    customer.likedVideos.push(newVideo);
    await this.repo.save(customer);
    return await this.videoService.updateLike(input)
  }

  async shareVideo(input) {
    return await this.videoService.updateShare(input)
  }
  async dislikeVideo(input: InputSetCustomerActionVideo) {
    const customer = await this.repo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
      .where('customer.id = :id', { id: input.user.id })
      .getOneOrFail();

    customer.likedVideos = customer.likedVideos.filter(likedVideo => likedVideo.id !== input.videoId);

    await this.repo.save(customer);
    return await this.videoService.updateDisLike(input)
  }

  async commentVideo(input) {
    return await this.commentService.create(input)
  }

  async getProfile(user) {
    const customer = await this.repo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.videos', 'videos')
      .leftJoinAndSelect('videos.comments', 'comments')
      .leftJoinAndSelect('videos.likers', 'likers')
      .where('customer.id = :id', { id: user.id })
      .getOneOrFail();

    customer.videos = customer.videos.sort((a, b) => {
      if (a.createAt > b.createAt) return -1;
      if (a.createAt < b.createAt) return 1;
      return 0;
    });
    return { customer }
  }

  async getViewProfile(user, customerId, res) {
    const customer = await this.repo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.videos', 'videos')
      .leftJoinAndSelect('videos.user', 'user')
      .leftJoinAndSelect('videos.comments', 'comments')
      .leftJoinAndSelect('videos.likers', 'likers')
      .where('customer.id = :id', { id: user.id })
      .getOneOrFail();
    customer.videos = customer.videos.sort((a, b) => {
      if (a.createAt > b.createAt) return -1;
      if (a.createAt < b.createAt) return 1;
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
  async isExist(input): Promise<boolean> {
    const customer = await this.repo.findOne({ where: { id: input.id } });
    return !!customer;
  }
}
