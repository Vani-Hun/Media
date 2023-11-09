import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Render,
  UploadedFile,
  UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param
} from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetAuth, InputSetCustomer, InputUpLoad, InputUpaDateVideo } from './customer.model';
import { CustomerService } from './customer.service';
import { Response } from 'express';
@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) { }

  @Get('upload')
  @UseGuards(CusAuthGuard)
  @Render('customer/upload')
  async getUpload(@Req() request: Request) {
    const user = await request['user']
    return await this.customerService.get(user)
  }

  @Get()
  @UseGuards(CusAuthGuard)
  @Render('scroll/index')
  async getVideo() {
    return await this.customerService.getVideo()
  }

  @Get('video/:videoId')
  @UseGuards(CusAuthGuard)
  @Render('scroll/detail')
  async getVideoById(@Param('videoId') videoId: string) {
    return await this.customerService.getVideoById(videoId)
  }


  @Get('profile')
  @UseGuards(CusAuthGuard)
  @Render('customer/profile')
  async getProfile(@Req() request: Request) {
    const user = await request['user']
    return await this.customerService.getProfile(user)
  }


  @Get('header')
  @UseGuards(CusAuthGuard)
  async getHeader(@Req() request: Request) {
    const user = await request['user']
    return await this.customerService.get(user)
  }

  @Post('profile/update')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@UploadedFile() avatar: Express.Multer.File, @Body() body: InputSetCustomer, @Req() request: Request) {
    body['user'] = request['user']
    body['avatar'] = avatar
    return await this.customerService.postProfile(body)
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
  async signUp(@Body() body: InputSetAuth) {
    return await this.customerService.signUp(body)
  }

  @Post('upload')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async upLoad(@Body() body: InputUpLoad, @UploadedFile() video: Express.Multer.File, @Req() request: Request) {
    if (video) {
      body.user = request['user']
      body.video = video
      return await this.customerService.upVideo(body)
    }
  }

  @Post('video/update')
  @UseGuards(CusAuthGuard)
  async updateVideo(@Body() body: InputUpaDateVideo, @Req() request: Request) {
    if (body) {
      body.user = request['user']
      return await this.customerService.upDateVideo(body)
    }
  }

  @Delete('video/delete/:videoId')
  @UseGuards(CusAuthGuard)
  async deleteVideo(@Param('videoId') videoId: string, @Req() request: Request) {
    return await this.customerService.deleteVideo(videoId, request['user'])
  }

  @Delete()
  async delete(@Body('id') id: string) {
    return await this.customerService.delete(id);
  }
}
