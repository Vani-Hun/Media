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
import { AuthGuard } from 'src/common/guard/auth.guard';
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

  // Login

  @Post('login')
  @Redirect('/admin/home')
  async login(@Res() res: Response, @Body() body: InputSetLogin) {
    const jwt = await this.adminService.login(body);
    res.cookie('gpt_admin', jwt);
  }
}
