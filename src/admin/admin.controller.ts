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
import { InputSetHome } from 'src/home/home.model';
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

  @Get('personnel/add')
  @UseGuards(AuthGuard)
  @Render('admin/personnel/add/index')
  async getAddPersonnel() { }

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
