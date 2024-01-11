import { NotificationService } from './../notification/notification.service';
import { Inject, Injectable, HttpException, HttpStatus, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { FindOneOptions, Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { InputSetCustomer, InputSetAuth, InputSetCustomerActionVideo } from './customer.model';
import { VideoService } from 'src/video/video.service';
import { TokenService } from 'src/common/services/token.service';
const { getStorage, getDownloadURL } = require('firebase-admin/storage');
import { readFileSync } from 'fs';
import * as bcrypt from 'bcrypt';
import { SmsService } from 'src/common/services/twilio.service';
import { NotificationMess, NotificationType } from 'src/notification/notitfication.entity';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
    @InjectRepository(Customer) repo: Repository<Customer>,
    private tokenService: TokenService,
    @Inject(forwardRef(() => VideoService)) private videoService: VideoService,
    private notificationService: NotificationService,
    private smsService: SmsService
  ) {
    super(repo);
  }

  async signIn(input: InputSetAuth, res) {
    const existingUser = await this.repo.findOne({
      where: { username: input.username },
    });
    const isPasswordValid = await bcrypt.compare(input.password, existingUser.password);
    if (!existingUser || !isPasswordValid) {
      throw new HttpException('Your username is not exist or password is wrong!!', HttpStatus.UNAUTHORIZED);
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
    const existingUser = await this.repo.findOne({
      where: [{ username: input.username }, { email: input.username }],
    });

    if (!existingUser) {
      const otp = Math.floor(Math.random() * 1000000).toString()
      const formattedPhoneNumber = `+84${input.phone.slice(1)}`;
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
    const existingUser = await this.repo
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', {
        username: input.username,
        email: input.username,
      })
      .getOne();
    if (!existingUser) {
      const newUser = this.repo.create({ ...input });
      const createUser = await this.repo.save(newUser);
      return createUser;
    }

    throw new HttpException('Your username or email is already registered.', HttpStatus.CONFLICT);
  }


  async signUpVerify(input) {
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

  async getUser(input) {
    const customer = await this.repo
      .createQueryBuilder('customer')
      .where('customer.id = :id', { id: input.id })
      .leftJoinAndSelect('customer.notifications', 'notifications')
      .leftJoinAndSelect('customer.videos', 'videos')
      .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
      .leftJoinAndSelect('customer.following', 'following')
      .leftJoinAndSelect('customer.followers', 'followers')
      .leftJoinAndSelect('videos.user', 'user')
      .leftJoinAndSelect('videos.comments', 'commentsVideo')
      .leftJoinAndSelect('videos.likers', 'likers')
      .leftJoinAndSelect('notifications.interactingUser', 'interactingUser')
      .leftJoinAndSelect('notifications.video', 'video')
      .leftJoinAndSelect('likedVideos.comments', 'commentslikedVideo')
      .leftJoinAndSelect('likedVideos.likers', 'likerslikedVideo')
      .leftJoinAndSelect('commentslikedVideo.customer', 'commentCustomer')
      .orderBy('videos.createAt', 'DESC')
      .addOrderBy('notifications.createAt', 'DESC')
      .getOneOrFail();

    return { customer }
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

  async getViewProfile(input, res) {
    const customer = await this.getUser(input)
    if (input.id === input.customerId) {
      return res.render('customer/profile', { customer })
    } else { return res.render('customer/viewProfile', { customer }) }
  }

  async postProfile(input) {
    let downloadURL;
    let updateData;
    // const url = await this.uploadFile(user)
    if (input.avatar) {
      const data = readFileSync(input.avatar.path);
      const fileBuffer = Buffer.from(data);
      const filePath = `avatars/${input.id}`;
      const file = this.firebaseConfig.bucket.file(filePath);

      const [fileExists] = await file.exists();
      if (fileExists) {
        await file.delete();
        console.log(`Đã xóa tệp tin tồn tại: ${filePath}`);
      }
      await file.save(fileBuffer, {
        metadata: {
          contentType: input.avatar.mimetype,
        },
      });
      await this.clearTmp(input.avatar.path);
      const fileRef = await getStorage().bucket(`${this.firebaseConfig.bucket.name}`).file(`${file.name}`);
      downloadURL = await getDownloadURL(fileRef);
      updateData = {
        /* Các trường dữ liệu bạn muốn cập nhật, ví dụ: */
        logo: downloadURL,
        username: input.username,
        name: input.name,
        bio: input.bio
      };
    } else {
      updateData = {
        username: input.username,
        name: input.name,
        bio: input.bio
      };
    }
    const customer = await this.repo.update({ id: input.id }, updateData)
    return { customer }
  }

  async followUser(input) {
    try {
      const userRequest = await this.repo.createQueryBuilder('customer')
        .leftJoinAndSelect('customer.following', 'following')
        .where('customer.id = :id', { id: input.id })
        .getOneOrFail();

      const isFollowed = userRequest.following.some(following => following.id === input.customerId);

      if (!isFollowed) {
        const userRequested = await this.repo.findOneOrFail(input.customerId);

        userRequest.following.push(userRequested);
        await this.repo.save(userRequest);

        input.type = NotificationType.FOLLOWER;
        input.mess = `${NotificationMess.FOLLOWER}.`;

        await this.notificationService.createNotification(input);
      }

      return {};
    } catch (error) {
      throw new HttpException(`Failed to follow user: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async unfollowUser(input) {
    return await this.repo
      .createQueryBuilder()
      .relation(Customer, 'following')
      .of(input.id)
      .remove(input.customerId);
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
