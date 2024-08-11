import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BaseService } from 'src/common/services/base.service';
import { CacheService } from 'src/common/services/cache.service';
import { TokenService } from 'src/common/services/token.service';
import { InputSetCustomer } from 'src/customer/customer.model';
import { CustomerService } from 'src/customer/customer.service';
import { InputSetHome } from 'src/home/home.model';
import { HomeService } from 'src/home/home.service';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { InputSetLogin, InputSetRegister } from './admin.model';

@Injectable()
export class AdminService extends BaseService<Admin> {
  private bcrypt;
  constructor(
    @InjectRepository(Admin) repo: Repository<Admin>,
    private tokenService: TokenService
  ) {
    super(repo);
    this.bcrypt = bcrypt;
  }

  async getAdmin() {
    try {
      return await this.repo.createQueryBuilder('admin')
        .getOne();
    } catch (error) {
      console.error(error)
    }
  }

  async getAdminByAdmin(input) {
    try {
      if (input) {
        const admin = await this.repo.createQueryBuilder('admin')
          .where('admin.id = :id', { id: input.id })
          .leftJoinAndSelect('admin.conversations', 'conversations')
          .leftJoinAndSelect('conversations.messages', 'messages')
          .leftJoinAndSelect('conversations.participant_id', 'participant_id')
          .getOne();
        return { admin }
      }
      return { admin: null }
    } catch (error) {
      console.error(error)
    }
  }

  async signIn(input, res) {
    try {
      const existingUser = await this.repo.findOne({
        where: { username: input.username },
      });
      console.log("existingUser:", existingUser)
      const isPasswordMatching = await bcrypt.compare(input.password, existingUser.password)
      if (!existingUser || !isPasswordMatching) {
        return res.redirect('/admin/sign-in')
      }

      const payload = {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
      };

      const sign = this.tokenService.sign(payload);

      res.cookie('accessTokenAdmin', sign, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000 });
      return res.redirect('/admin/message')
    } catch (error) {
      console.error(`Error in signIn: ${error.message}`);
      return res.redirect('/admin/sign-in')
    }
  }

  async isExist(input): Promise<boolean> {
    try {
      const admin = await this.repo.findOne({ where: { id: input.id } });
      return !!admin;
    } catch (error) {
      console.error(`Error in isExist: ${error.message}`);
      // throw new HttpException('Error in isExist.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
