import { ConversationService } from './../conversation/conversation.service';
import { Conversation } from './../conversation/conversation.entity';
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
import { MessageService } from 'src/message/message.service';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class CustomerService extends BaseService<Customer> {
  constructor(
    @Inject('FIREBASE_CONFIG') protected readonly firebaseConfig,
    @InjectRepository(Customer) repo: Repository<Customer>,
    private tokenService: TokenService,
    @Inject(forwardRef(() => VideoService)) private videoService: VideoService,
    private notificationService: NotificationService,
    private smsService: SmsService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private adminService: AdminService
  ) {
    super(repo);
  }

  async signIn(input: InputSetAuth, res) {
    try {
      const existingUser = await this.repo.findOne({
        where: { username: input.username },
      });

      if (!existingUser) {
        throw new HttpException('Your username is not exist!!', HttpStatus.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(input.password, existingUser.password);

      if (!isPasswordValid) {
        throw new HttpException('Password is wrong!!', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
      };

      const sign = this.tokenService.sign(payload);

      res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
      return res.redirect('/video/videos')
    } catch (error) {
      console.error(`Error in signIn: ${error.message}`);
      throw new HttpException('Internal Server Error or Password is wrong', HttpStatus.UNAUTHORIZED);
    }
  }

  async googleLogin(input, res) {
    try {
      const existingUser = await this.repo.findOne({
        where: { email: input.emails[0].value }
      });

      if (!existingUser) {
        const userCreate = {
          logo: input.photos[0].value,
          email: input.emails[0].value,
          name: input.name.givenName + " " + input.name.familyName,
          username: "user" + input.name.givenName,
          password: null,
          phone: null
        };

        const user = await this.signUpOAuth2(userCreate);

        const payload = {
          id: user.id,
          username: user.username,
          name: user.name
        };

        const sign = this.tokenService.sign(payload);
        const admin = await this.adminService.getAdmin()
        console.log("admin:", admin)
        let data = {
          senderId: admin.id,
          receiverId: user.id,
          text: "Upload một video mỗi ngày để thêm động lực và năng lượng cho cả ngày dài. Nếu bạn gặp bất kỳ vấn đề nào, đừng ngần ngại liên hệ với tôi. Chúc bạn có một ngày tuyệt vời và tràn đầy ý nghĩa!"
        }
        const conversation = await this.conversationService.createConversationWithAdmin(data)
        console.log("conversation:", conversation)
        return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
      } else {
        const payload = {
          id: existingUser.id,
          username: existingUser.username,
          name: existingUser.name
        };

        const sign = this.tokenService.sign(payload);
        const admin = await this.adminService.getAdmin()
        console.log("admin:", admin)
        let data = {
          senderId: admin.id,
          receiverId: existingUser.id,
          text: "Upload một video mỗi ngày để thêm động lực và năng lượng cho cả ngày dài. Nếu bạn gặp bất kỳ vấn đề nào, đừng ngần ngại liên hệ với tôi. Chúc bạn có một ngày tuyệt vời và tràn đầy ý nghĩa!"
        }
        const conversation = await this.conversationService.createConversationWithAdmin(data)
        return res.cookie('accessToken', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
      }
    } catch (error) {
      console.error(`Error in googleLogin: ${error.message}`);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async facebookLogin(input, res) {
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

  async signUp(input: InputSetAuth, res): Promise<void> {
    try {
      const [existingUsername, existingPhoneUser] = await Promise.all([
        this.repo.findOne({ where: { username: input.username } }),
        this.repo.findOne({ where: { phone: input.phone } })
      ]);

      if (existingUsername) {
        throw new HttpException('Your username is already registered.', HttpStatus.CONFLICT);
      }

      if (existingPhoneUser) {
        throw new HttpException('Your phone is already registered.', HttpStatus.CONFLICT);
      }


      if (!existingUsername && !existingPhoneUser) {
        // const otp = Math.floor(Math.random() * 1000000).toString();
        // const formattedPhoneNumber = `+84${input.phone.slice(1)}`;
        // await this.smsService.sendOtpViaSms(formattedPhoneNumber, otp);

        // const hashedOTP = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(input.password, 10);
        res.cookie('username', input.username, { maxAge: 120 * 1000 });
        res.cookie('phone', input.phone, { maxAge: 120 * 1000 });
        res.cookie('hashedPassword', hashedPassword, { maxAge: 120 * 1000 });
        // res.cookie('hashedOTP', hashedOTP, { httpOnly: true, maxAge: 60 * 1000 });
        return res.render('customer/sign-up-otp', { customer: null, message: null });
      }
    } catch (error) {
      // Handle the error, log, or rethrow if necessary
      console.error(`Error in signUp: ${error.message}`);
      throw error;
    }
  }

  async signUpOAuth2(input: InputSetAuth): Promise<any> {
    try {
      // const existingUser = await this.repo
      //   .createQueryBuilder('user')
      //   .where('user.email = :email', { email: input.username })
      //   .getOne();

      // if (!existingUser) {

      // }
      const newUser = this.repo.create({ ...input });
      const createUser = await this.repo.save(newUser);
      return createUser;
      // throw new HttpException('Your username or phone is already registered.', HttpStatus.CONFLICT);
    } catch (error) {
      // Handle the error, log, or rethrow if necessary
      console.error(`Error in signUpOAuth2: ${error.message}`);
      throw new HttpException('Error in signUpOAuth2.', HttpStatus.UNAUTHORIZED);
    }
  }



  async signUpVerify(input) {
    try {
      return await this.repo.save(this.repo.create({ username: input.username, name: `user${input.username}`, password: input.hashedPassword, phone: input.phone }));
    } catch (error) {
      throw new HttpException('Error in signUp.', HttpStatus.CONFLICT);
    }
    // if (input.otp && input.hashedOTP) {
    //   const compare = await bcrypt.compare(input.otp, input.hashedOTP);
    //   if (compare) {
    //     return this.repo.save(this.repo.create({ username: input.username, name: `user${input.username}`, password: input.hashedPassword, phone: input.phone }));
    //   } else {
    //     throw new HttpException('OTP not correct', HttpStatus.UNPROCESSABLE_ENTITY);
    //   }
    // } else {
    //   throw new HttpException('OTP is expired, please click cancel', HttpStatus.FORBIDDEN);
    // }
  }

  async getUser(input) {
    try {
      return await this.repo.createQueryBuilder('customer')
        .where('customer.id = :id', { id: input.id })
        .leftJoinAndSelect('customer.notifications', 'notifications')
        .leftJoinAndSelect('customer.conversations', 'conversations')
        .leftJoinAndSelect('customer.videos', 'videos')
        .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
        .leftJoinAndSelect('customer.following', 'following')
        .leftJoinAndSelect('customer.followers', 'followers')
        .leftJoinAndSelect('conversations.participant_id', 'participant_id')
        .leftJoinAndSelect('conversations.user_id', 'user_id')
        .leftJoinAndSelect('conversations.messages', 'messeages')
        .leftJoinAndSelect('videos.user', 'user')
        .leftJoinAndSelect('videos.comments', 'commentsVideo')
        .leftJoinAndSelect('videos.likers', 'likers')
        .leftJoinAndSelect('videos.hashtags', 'hashtags')
        .leftJoinAndSelect('notifications.interactingUser', 'interactingUser')
        .leftJoinAndSelect('notifications.video', 'video')
        .leftJoinAndSelect('likedVideos.comments', 'commentslikedVideo')
        .leftJoinAndSelect('likedVideos.likers', 'likerslikedVideo')
        .leftJoinAndSelect('commentslikedVideo.customer', 'commentCustomer')
        .leftJoinAndSelect('commentsVideo.customer', 'commentsVideoCustomer')
        .orderBy('videos.createdAt', 'DESC')
        .addOrderBy('notifications.createdAt', 'DESC')
        .getOne();

    } catch (error) {
      console.error(`Error in getUser: ${error.message}`);
      throw new HttpException('Error in getUser.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async getSimpleUser(input) {
    try {
      return await this.repo.createQueryBuilder('customer')
        .where('customer.username = :username', { username: input.mention })
        .getOne();
    } catch (error) {
      console.error(`Error in getUser: ${error.message}`);
      throw new HttpException('Error in getUser.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserWithFollowingVideos(input) {
    try {
      return await this.repo.createQueryBuilder('customer')
        .where('customer.id = :id', { id: input.id })
        .leftJoinAndSelect('customer.notifications', 'notifications')
        .leftJoinAndSelect('customer.conversations', 'conversations')
        .leftJoinAndSelect('customer.videos', 'videos')
        .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
        .leftJoinAndSelect('customer.following', 'following')
        .leftJoinAndSelect('customer.followers', 'followers')
        .leftJoinAndSelect('following.videos', 'followingVideos')
        .leftJoinAndSelect('following.following', 'followingUserFollow')
        .leftJoinAndSelect('conversations.participant_id', 'participant_id')
        .leftJoinAndSelect('conversations.user_id', 'user_id')
        // .leftJoinAndSelect('videos.user', 'user')
        // .leftJoinAndSelect('videos.comments', 'commentsVideo')
        // .leftJoinAndSelect('videos.likers', 'likers')
        .leftJoinAndSelect('notifications.interactingUser', 'interactingUser')
        .leftJoinAndSelect('notifications.video', 'video')
        .leftJoinAndSelect('likedVideos.comments', 'commentslikedVideo')
        .leftJoinAndSelect('likedVideos.likers', 'likerslikedVideo')
        // .leftJoinAndSelect('commentslikedVideo.customer', 'commentCustomer')
        // .leftJoinAndSelect('commentsVideo.customer', 'commentsVideoCustomer')
        .leftJoinAndSelect('followingVideos.user', 'followingVideosUser')
        .leftJoinAndSelect('followingVideos.comments', 'commentsVideo')
        .leftJoinAndSelect('followingVideos.likers', 'likers')
        .leftJoinAndSelect('commentsVideo.customer', 'commentsVideoCustomer')
        .orderBy('videos.createdAt', 'DESC')
        .addOrderBy('notifications.createdAt', 'DESC')
        .getOne();
    } catch (error) {
      console.error(`Error in getUser: ${error.message}`);
      throw new HttpException('Error in getUser.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  };

  async getVideoLiked(userId) {
    try {
      const customer = await this.repo.createQueryBuilder('customer')
        .leftJoinAndSelect('customer.likedVideos', 'likedVideos')
        .leftJoinAndSelect('likedVideos.comments', 'comments')
        .leftJoinAndSelect('comments.customer', 'commentCustomer')
        .leftJoinAndSelect('likedVideos.likers', 'likers')
        .where('customer.id = :id', { id: userId })
        .getOneOrFail();
      return { customer }
    } catch (error) {
      console.error(`Error in getVideoLiked: ${error.message}`);
      throw new HttpException('Error in getVideoLiked.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async getViewProfile(input, res) {
    try {
      const customer = await this.getUser(input)
      if (input.id === input.customerId) {
        return res.render('customer/profile', { customer, cursor: "Profile" })
      } else {
        input.id = input.customerId
        const user = await this.getUser(input)
        return res.render('customer/viewProfile', { customer, user, cursor: null })
      }
    } catch (error) {
      console.error(`Error in getViewProfile: ${error.message}`);
      throw new HttpException('Error in getViewProfile.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async postProfile(input) {
    const isExist = await this.repo.createQueryBuilder('customer')
      .where("customer.username = :username", { username: input.username })
      .getOne();
    if (isExist) {
      throw new HttpException('Username exists.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (input.username.length < 6 || input.name.length < 6) {
      throw new HttpException('Username and name must each contain at least 6 characters.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
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
      return { customer, mess: "Success" }
    } catch (error) {
      console.error(`Error in update: ${error.message}`);
      throw new HttpException('Error in update.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async followUser(input) {
    try {
      const userRequest = await this.repo.createQueryBuilder('customer')
        .leftJoinAndSelect('customer.following', 'following')
        .where('customer.id = :id', { id: input.id })
        .getOneOrFail();

      const isFollowed = userRequest.following.some(following => following.id === input.customerId);

      if (isFollowed === false) {
        const userRequested = await this.repo.createQueryBuilder('customer')
          .where('customer.id = :id', { id: input.customerId })
          .getOneOrFail();

        await userRequest.following.push(userRequested);
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
    try {
      input.type = NotificationType.FOLLOWER;
      await this.notificationService.deleteNotification(input);
      return await this.repo
        .createQueryBuilder()
        .relation(Customer, 'following')
        .of(input.id)
        .remove(input.customerId);
    } catch (error) {
      console.error(`Error in unfollowUser: ${error.message}`);
      throw new HttpException('Error in unfollowUser.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  async delete(id: string) {
    try {
      const customer = await this.findById(id);
      customer.logo && this.clearFile(customer.logo);
      return !!(await this.repo.delete(id));
    } catch (error) {
      console.error(`Error in delete: ${error.message}`);
      throw new HttpException('Error in delete.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async isExist(input): Promise<boolean> {
    try {
      const customer = await this.repo.findOne({ where: { id: input.id } });
      return !!customer;
    } catch (error) {
      console.error(`Error in isExist: ${error.message}`);
      throw new HttpException('Error in isExist.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
