import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Render,
  UploadedFile,
  UseInterceptors, Query, Redirect, UseGuards, Res, Req
} from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetAuth, InputSetCustomer, InputUpLoad } from './customer.model';
import { CustomerService } from './customer.service';
import { Response } from 'express';
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) { }

  @Get('upload')
  @UseGuards(CusAuthGuard)
  @Render('customer/upload')
  getUpload(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return
  }

  @Get()
  @Render('scroll/index')
  getVideo() {
    return this.customerService.getVideo()
  }

  @Get('profile')
  @UseGuards(CusAuthGuard)
  @Render('customer/profile')
  async getProfile(@Req() request: Request) {
    const user = await request['user']
    return this.customerService.getProfile(user)
  }


  @Get('header')
  @UseGuards(CusAuthGuard)
  async getHeader(@Req() request: Request) {
    const user = await request['user']
    return this.customerService.get(user)
  }

  @Post('profile/update')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@UploadedFile() avatar: Express.Multer.File, @Body() body: InputSetCustomer, @Req() request: Request) {
    body['user'] = request['user']
    body['avatar'] = avatar
    return this.customerService.postProfile(body)
  }

  @Get('sign-in')
  @Render('customer/index')
  getSignin(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }
  @Get('log-out')
  getLogout(@Res() res: Response) {
    res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true });

    return res.redirect('/');

  }
  @Get('sign-up')
  @Render('customer/sign-up')
  getSignup(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }

  @Post('sign-in')
  async signIn(@Body() body: InputSetAuth, @Res() res: Response) {
    await this.customerService.signIn(body, res)
    return res.redirect('/');
  }

  @Post('sign-up')
  @Redirect('/customer/upload')
  signUp(@Body() body: InputSetAuth) {
    return this.customerService.signUp(body)
  }

  @Post('upload')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  upLoad(@Body() body: InputUpLoad, @UploadedFile() video: Express.Multer.File, @Req() request: Request) {
    if (video) {
      body.user = request['user']
      body.video = video
      return this.customerService.upVideo(body)
    }


  }

  @Delete()
  delete(@Body('id') id: string) {
    return this.customerService.delete(id);
  }
}
