import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    private tokenService: TokenService,
    private cacheService: CacheService,
    private homeService: HomeService,
    private customerService: CustomerService,
  ) {
    super(repo);
    this.bcrypt = bcrypt;
  }

  getAdminHome() {
    return this.homeService.get();
  }

  async getCustomer(page?: string) {
    const customers = await this.customerService.getAll();
    if (page) {
      return { customers, start: parseInt(page) * 4 };
    }

    return { customers, start: 0 };
  }

  getDetailCustomer(id: string) {
    return
  }



  deleteCustomer(id: string) {
    return this.customerService.delete(id);
  }


  getAddPartner() {
    return this.customerService.getAll();
  }

  // logo

  updateLogo(file: Express.Multer.File) {
    return this.updateFile(file, "img/logo/logo.png")
  }

  // banner

  updateBannerHome(file: Express.Multer.File) {
    return this.updateFile(file, "img/banner/bannerHome.jpg")
  }

  updateBannerPage(file: Express.Multer.File) {
    return this.updateFile(file, "img/banner/bannerPage.jpg")
  }

  // login

  async login(input: InputSetLogin) {
    const admin = await this.repo.findOne({
      where: { username: input.username }
    });
    console.log(admin)
    if (!admin) {
      throw new UnauthorizedException('Your username is incorrect!!');
    }
    if (!await this.bcrypt.compare(input.password, admin.password)) {
      throw new UnauthorizedException('Your password is incorrect');
    }
    const jwt = this.tokenService.sign({ ...admin });
    console.log('jwt:', jwt)
    await this.cacheService.setValue<string>(input.username, jwt, {
      ttl: 86400,
    });
    return jwt;
  }
  async register(input: InputSetRegister) {
    const admin = await this.repo.findOne({ username: input.username });
    if (!admin) {
      const saltRounds = 10;
      // const someOtherPlaintextPassword = 'not_bacon';
      bcrypt
        .hash(input.password, saltRounds)
        .then(hash => {
          console.log('Hash ', hash)
          const admin = this.repo.create({
            username: input.username,
            password: hash,
            permission: input.permission
          })
          return this.repo.save(admin)
        }
        )
        .catch(err => console.error(err.message))
      return true
    }
  }

  async isExist(input: Admin) {
    return !!(await this.findById(input.id));
  }
}
