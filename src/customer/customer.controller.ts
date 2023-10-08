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
    return this.customerService.get();
  }

  @Get()
  @Render('scroll/index')
  getVideo() {
    return this.customerService.getVideo()
  }

  @Get('sign-in')
  @Render('customer/index')
  getSignin(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }
  @Get('sign-up')
  @Render('customer/auth')
  getSignup(@Query('error') error: string) {
    if (error) {
      return { message: error };
    }
    return { message: null };
  }

  @Post('sign-in')
  async signIn(@Body() body: InputSetAuth, @Res() res: Response) {
    await this.customerService.signIn(body, res)
    return res.redirect('/customer');
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
      return this.customerService.uploadVideo(body)
    }


  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  post(
    @Body() body: InputSetCustomer,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    if (logo) {
      body.logo = logo;
    }
    if (body.id) {
      return this.customerService.update(body);
    }
    return this.customerService.create(body);
  }

  @Delete()
  delete(@Body('id') id: string) {
    return this.customerService.delete(id);
  }
}
