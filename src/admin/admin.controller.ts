import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Render,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { InputSetAboutUs } from 'src/aboutUs/aboutUs.model';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { InputSetContact } from 'src/contact/contact.model';
import { InputSetCustomer } from 'src/customer/customer.model';
import { InputSetDepartment } from 'src/department/department.model';
import { InputSetHome } from 'src/home/home.model';
import { InputSetPersonnel } from 'src/personnel/personnel.model';
import { InputGetRequest, InputSetProduct } from 'src/product/product.model';
import { InputSetProject } from 'src/project/project.model';
import { InputSetLogin, InputSetRegister } from './admin.model';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Get()
  @Render('admin/login/index')
  get(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }

  @Get('register')
  @Render('admin/register/index')
  getRegister(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }

  @Post('register')
  @Redirect('/admin')
  // @Redirect('/admin/register')
  async postRegister(@Res() res: Response, @Body() body: InputSetRegister) {
    const admin = await this.adminService.register(body);
    if (admin) {
      console.log('done')
    }
  }
  // Home

  @Get('home')
  @UseGuards(AuthGuard)
  @Render('admin/home/index')
  getHome() {
    return this.adminService.getAdminHome();
  }

  @Post('home')
  @UseGuards(AuthGuard)
  @Redirect('/admin/home')
  postHome(@Body() body: InputSetHome) {
    return this.adminService.setHome(body);
  }

  // About Us

  @Get('aboutus')
  @UseGuards(AuthGuard)
  @Render('admin/aboutUs/index')
  getAboutUs() {
    return this.adminService.getAdminAboutUs();
  }

  @Post('aboutus')
  @UseGuards(AuthGuard)
  @Redirect('/admin/aboutus')
  postAboutUs(@Body() body: InputSetAboutUs) {
    return this.adminService.setAboutUs(body);
  }

  // Product

  @Get('product')
  @UseGuards(AuthGuard)
  @Render('admin/product/index')
  getProduct(@Query() { productID, page }) {
    if (productID || page) {
      return this.adminService.getProduct({ productID }, page);
    }
    return this.adminService.getProduct();
  }

  @Get('product/edit')
  @UseGuards(AuthGuard)
  @Render('admin/productDetail/index')
  getProject(@Query() query: InputGetRequest) {
    return this.adminService.getProject(query);
  }

  @Get('product/add')
  @UseGuards(AuthGuard)
  @Render('admin/product/addNewProduct/index')
  getAddNewProduct() {
    return this.adminService.getProducts();
  }

  // @Post('product/project')
  // @UseInterceptors(FileInterceptor('file'))
  // @UseGuards(AuthGuard)
  // async postProject(
  //   @Body() body: InputSetProject,
  //   @Res() res: Response,
  //   @UploadedFile() banner: Express.Multer.File,
  // ) {
  //   if (banner) {
  //     body.banner = banner;
  //   }
  //   const project = await this.adminService.setProject(body);
  //   res.redirect(
  //     `/admin/product/edit?productID=${project.product.id}&projectID=${project.id}`,
  //   );
  //   return project;
  // }

  // @Delete('product/:projectID')
  // @UseGuards(AuthGuard)
  // @Redirect('/admin/product')
  // deleteProject(@Param('projectID') projectID: string) {
  //   return this.adminService.deleteProject(projectID);
  // }

  // Category

  @Get('category')
  @UseGuards(AuthGuard)
  @Render('admin/category/index')
  getCategory(@Query('page') page: string) {
    return this.adminService.getProducts(page);
  }

  @Get('category/edit')
  @UseGuards(AuthGuard)
  @Render('admin/category/edit/index')
  async getEditCategory(@Query('id') id: string) {
    return { category: await this.adminService.getCategory(id) };
  }

  @Get('category/add')
  @UseGuards(AuthGuard)
  @Render('admin/category/add/index')
  getAddCategory() { }

  @Post('category')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async postCategory(
    @Body() body: InputSetProduct,
    @Res() res: Response,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    if (banner) {
      body.banner = banner;
    }
    const category = await this.adminService.setCategory(body);
    res.redirect(`/admin/category/edit?id=${category.id}`);
    return category;
  }

  @Delete('category/:id')
  @UseGuards(AuthGuard)
  @Redirect('/admin/category')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Customer

  @Get('customer')
  @UseGuards(AuthGuard)
  @Render('admin/customer/index')
  getCustomer(@Query('page') page: string) {
    return this.adminService.getCustomer(page);
  }

  @Get('customer/edit')
  @UseGuards(AuthGuard)
  @Render('admin/customer/edit/index')
  async getEditCutsomer(@Query('id') id: string) {
    return { customer: await this.adminService.getDetailCustomer(id) };
  }

  @Get('customer/add')
  @UseGuards(AuthGuard)
  @Render('admin/customer/add/index')
  async getAddCustomer() { }

  @Post('customer')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async postCustomer(
    @Body() body: InputSetCustomer,
    @Res() res: Response,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    if (logo) body.logo = logo;
    const customer = await this.adminService.setCustomer(body);
    res.redirect(`/admin/customer/edit?id=${customer.id}`);
    return customer;
  }

  @Delete('customer/:id')
  @UseGuards(AuthGuard)
  @Redirect('/admin/customer')
  deleteCustomer(@Param('id') id: string) {
    return this.adminService.deleteCustomer(id);
  }

  @Get('partner/add')
  @UseGuards(AuthGuard)
  @Render('admin/partner/add/index')
  async getAddPartner() {
    return { customers: await this.adminService.getAddPartner() };
  }


  // Department

  @Get('department')
  @UseGuards(AuthGuard)
  @Render('admin/department/index')
  getDepartment(@Query('page') page: string) {
    return this.adminService.getDepartment(page);
  }

  @Get('department/edit')
  @UseGuards(AuthGuard)
  @Render('admin/department/edit/index')
  async getEditDepartment(@Query('id') id: string) {
    return { department: await this.adminService.getDetailDepartment(id) };
  }

  @Get('department/add')
  @UseGuards(AuthGuard)
  @Render('admin/department/add/index')
  async getAddDepartment() { }

  @Post('department')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async postDepartment(
    @Body() body: InputSetDepartment,
    @Res() res: Response,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    if (logo) body.logo = logo;
    const department = await this.adminService.setDepartment(body);
    res.redirect(`/admin/department/edit?id=${department.id}`);
    return department;
  }

  @Delete('department/:id')
  @UseGuards(AuthGuard)
  @Redirect('/admin/department')
  deleteDepartment(@Param('id') id: string) {
    return this.adminService.deleteDepartment(id);
  }

  // Personnel

  @Get('personnel')
  @UseGuards(AuthGuard)
  @Render('admin/personnel/index')
  getPersonnel(@Query('page') page: string) {
    return this.adminService.getPersonnel(page);
  }

  @Get('personnel/edit')
  @UseGuards(AuthGuard)
  @Render('admin/personnel/edit/index')
  async getEditPersonnel(@Query('id') id: string) {
    return { personnel: await this.adminService.getDetailPersonnel(id) };
  }

  @Get('personnel/add')
  @UseGuards(AuthGuard)
  @Render('admin/personnel/add/index')
  async getAddPersonnel() { }

  @Post('personnel')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  async postPersonnel(
    @Body() body: InputSetPersonnel,
    @Res() res: Response,
    @UploadedFile() img: Express.Multer.File,
  ) {
    if (img) body.img = img;
    const personnel = await this.adminService.setPersonnel(body);
    res.redirect(`/admin/personnel/edit?id=${personnel.id}`);
    return personnel;
  }

  @Delete('personnel/:id')
  @UseGuards(AuthGuard)
  @Redirect('/admin/personnel')
  deletePersonnel(@Param('id') id: string) {
    return this.adminService.deletePersonnel(id);
  }

  // Update Logo

  @Get('logo')
  @UseGuards(AuthGuard)
  @Render('admin/logo/index')
  getLogo() { }

  @Post('logo')
  @Redirect('/admin/logo')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateLogo(@UploadedFile() logo: Express.Multer.File) {
    if (logo) {
      return this.adminService.updateLogo(logo)
    }
    return {}
  }

  // Update Banner
  @Get('banner')
  @UseGuards(AuthGuard)
  @Render('admin/banner/index')
  getBanner() { }

  @Post('banner/home')
  @Redirect('/admin/banner')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateBannerHome(@UploadedFile() banner: Express.Multer.File) {
    if (banner) {
      return this.adminService.updateBannerHome(banner)
    }

    return {}
  }

  @Post('banner/page')
  @Redirect('/admin/banner')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  updateBannerPage(@UploadedFile() banner: Express.Multer.File) {
    if (banner) {
      return this.adminService.updateBannerPage(banner)
    }

    return {}
  }

  // Contact

  @Get('contact')
  @Render('admin/contact/index')
  @UseGuards(AuthGuard)
  getContact() {
    return this.adminService.getContact()
  }

  @Post('contact')
  @Redirect('/admin/contact')
  @UseGuards(AuthGuard)
  postContact(@Body() body: InputSetContact) {
    return this.adminService.setContact(body)
  }

  // Login

  @Post('login')
  @Redirect('/admin/home')
  async login(@Res() res: Response, @Body() body: InputSetLogin) {
    const jwt = await this.adminService.login(body);
    res.cookie('gpt_admin', jwt);
  }
}
