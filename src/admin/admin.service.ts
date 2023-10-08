import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { InputSetAboutUs } from 'src/aboutUs/aboutUs.model';
import { AboutUsService } from 'src/aboutUs/aboutUs.service';
import { BaseService } from 'src/common/services/base.service';
import { CacheService } from 'src/common/services/cache.service';
import { TokenService } from 'src/common/services/token.service';
import { InputSetContact } from 'src/contact/contact.model';
import { ContactService } from 'src/contact/contact.service';
import { InputSetCustomer } from 'src/customer/customer.model';
import { CustomerService } from 'src/customer/customer.service';
import { InputSetDepartment } from 'src/department/department.model';
import { DepartmentService } from 'src/department/department.service';
import { InputSetHome } from 'src/home/home.model';
import { HomeService } from 'src/home/home.service';
import { InputSetPersonnel } from 'src/personnel/personnel.model';
import { PersonnelService } from 'src/personnel/personnel.service';
import { InputGetRequest, InputSetProduct } from 'src/product/product.model';
import { ProductService } from 'src/product/product.service';
import { InputSetProject } from 'src/project/project.model';
import { ProjectService } from 'src/project/project.service';
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
    private aboutUsService: AboutUsService,
    private productService: ProductService,
    private projectService: ProjectService,
    private customerService: CustomerService,
    private departmentService: DepartmentService,
    private personnelService: PersonnelService,
    private contactService: ContactService
  ) {
    super(repo);
    this.bcrypt = bcrypt;
  }

  getAdminHome() {
    return this.homeService.get();
  }

  setHome(input: InputSetHome) {
    return this.homeService.update(input);
  }

  getAdminAboutUs() {
    return this.aboutUsService.get();
  }

  setAboutUs(input: InputSetAboutUs) {
    return this.aboutUsService.update(input);
  }

  // Product

  async getProduct(input?: InputGetRequest, page?: string) {
    let data;
    if (input) {
      data = await this.productService.getRequest(input);
    } else {
      data = await this.productService.getRequest();
    }

    if (page) {
      return { ...data, start: parseInt(page) * 4 };
    }

    return { ...data, start: 0 };
  }

  async getProducts(page?: string) {
    const products = await this.productService.getAll();
    if (page) {
      return { products, start: parseInt(page) * 5 };
    }

    return { products, start: 0 };
  }

  // Category

  async getCategory(id: string) {
    return this.productService.getOne(id);
  }

  setCategory(input: InputSetProduct) {
    if (input.id) {
      return this.productService.update(input);
    }
    return this.productService.create(input);
  }

  deleteCategory(id: string) {
    return this.productService.delete(id);
  }

  // Project

  getProject(input: InputGetRequest) {
    return this.productService.getRequest(input);
  }


  // Customer

  async getCustomer(page?: string) {
    const customers = await this.customerService.getAll();
    if (page) {
      return { customers, start: parseInt(page) * 4 };
    }

    return { customers, start: 0 };
  }

  getDetailCustomer(id: string) {
    return this.customerService.get();
  }

  setCustomer(input: InputSetCustomer) {
    if (input.id) {
      return this.customerService.update(input);
    }
    return this.customerService.create(input);
  }

  deleteCustomer(id: string) {
    return this.customerService.delete(id);
  }


  getAddPartner() {
    return this.customerService.getAll();
  }


  // Department

  async getDepartment(page: string) {
    const departments = await this.departmentService.getAll();
    if (page) {
      return { departments, start: parseInt(page) * 4 };
    }

    return { departments, start: 0 };
  }

  getDetailDepartment(id: string) {
    return this.departmentService.get(id);
  }

  setDepartment(input: InputSetDepartment) {
    if (input.id) {
      return this.departmentService.update(input);
    }
    return this.departmentService.create(input);
  }

  deleteDepartment(id: string) {
    return this.departmentService.delete(id);
  }

  // Personnel

  async getPersonnel(page: string) {
    const personnels = await this.personnelService.getAll();
    if (page) {
      return { personnels, start: parseInt(page) * 4 };
    }

    return { personnels, start: 0 };
  }

  getDetailPersonnel(id: string) {
    return this.personnelService.get(id);
  }

  setPersonnel(input: InputSetPersonnel) {
    if (input.id) {
      return this.personnelService.update(input);
    }
    return this.personnelService.create(input);
  }

  deletePersonnel(id: string) {
    return this.personnelService.delete(id);
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

  // Contact

  getContact() {
    return this.contactService.get();
  }

  setContact(input: InputSetContact) {
    return this.contactService.update(input)
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
