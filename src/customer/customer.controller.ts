import { Inject, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetAuth, InputSetCustomer, InputUpLoad, InputUpaDateVideo } from './customer.model';
import { CustomerService } from './customer.service';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) { }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
    console.log("req.user:", req.user)
    const token = await this.customerService.googleLogin(req.user, res);
    if (token) {
      return res.redirect('/')
    }
  };

  @Get('facebook/login')
  @UseGuards(AuthGuard("facebook"))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req, @Res() res) {
    console.log("req.user:", req.user)
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    }
    // const token = await this.customerService.facebookLogin(req.user, res);
    // if (token) {
    //   return res.redirect('/')
    // }
  }

  @Get('upload')
  @UseGuards(CusAuthGuard)
  @Render('customer/upload')
  async getUpload(@Req() request: Request) {
    const user = await request['user']
    return await this.customerService.get(user)
  }

  @Get('videos')
  @UseGuards(CusAuthGuard)
  @Render('video/index')
  async getVideos(@Req() request: Request) {
    return await this.customerService.getVideo(request['user'].id)
  }

  @Get('videos/list')
  @UseGuards(CusAuthGuard)
  async getVideosList(@Req() request: Request) {
    return await this.customerService.getVideo(request['user'].id)
  }

  @Get('video/:videoId')
  @UseGuards(CusAuthGuard)
  @Render('video/detail')
  async getVideoById(@Param('videoId') videoId: string, @Req() request: Request) {
    return await this.customerService.getVideoById(videoId, request['user'].id)
  }

  @Get('videoInf/:id')
  @UseGuards(CusAuthGuard)
  async getVideo(@Param('id') videoId: string, @Req() request: Request) {
    return await this.customerService.getVideoById(videoId, request['user'].id)
  }

  @Get('videos/like')
  @UseGuards(CusAuthGuard)
  async getVideoLiked(@Req() request: Request) {
    return await this.customerService.getVideoLiked(request['user'].id)
  }

  @Post('video/like/:videoId')
  @UseGuards(CusAuthGuard)
  async likeVideo(@Param('videoId') videoId: string, @Req() request: Request) {
    const input = {
      user: request['user'],
      videoId: videoId
    }
    return await this.customerService.likeVideo(input)
  };

  @Post('video/share/:videoId')
  @UseGuards(CusAuthGuard)
  async shareVideo(@Param('videoId') videoId: string, @Req() request: Request) {
    const input = {
      user: request['user'],
      videoId: videoId
    }
    return await this.customerService.shareVideo(input)
  };


  @Post('video/dislike/:videoId')
  @UseGuards(CusAuthGuard)
  async dislikeVideo(@Param('videoId') videoId: string, @Req() request: Request) {
    const input = {
      user: request['user'],
      videoId: videoId
    }
    return await this.customerService.dislikeVideo(input)
  }

  @Post('video/comment/:videoId')
  @UseGuards(CusAuthGuard)
  async commentVideo(@Body() body, @Param('videoId') videoId: string, @Req() request: Request) {
    const input = {
      user: request['user'],
      videoId: videoId,
      mess: body.mess
    }
    return await this.customerService.commentVideo(input)
  }

  @Get('profile/:customerId')
  @UseGuards(CusAuthGuard)
  async getViewProfile(@Param('customerId') customerId: string, @Res() res: Response, @Req() request: Request) {
    console.log("customerId:", customerId)
    const user = await request['user']
    return await this.customerService.getViewProfile(user, customerId, res)
  };

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
  async getLogout(@Res() res: Response) {
    res.cookie('accessToken', '', { expires: new Date(0), httpOnly: true });
    return res.redirect('/customer/sign-in');

  }

  @Get('sign-up')
  @Render('customer/sign-up')
  async getSignup(@Query('error') error: string) {
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
  async signUp(@Body() body: InputSetAuth, @Res() res: Response) {
    return await this.customerService.signUp(body, res)
  }

  @Get('verify-otp')
  @Render('customer/sign-up-otp')
  async getVerifyOtp(@Query('error') error: string) {
    console.log("errorgetVerifyOtp:", typeof error)
    if (error) {
      return { message: error };
    }
    return { message: null };
  }

  @Post('verify-otp')
  @Render('video/index')
  async verifyOtp(@Body() body, @Res() res: Response, @Req() request: Request) {
    const hashedOTP = request.cookies['hashedOTP']
    const username = request.cookies['username']
    const phone = request.cookies['phone']
    const hashedPassword = request.cookies['hashedPassword']
    body.hashedOTP = hashedOTP
    body.username = username
    body.phone = phone
    body.hashedPassword = hashedPassword
    return await this.customerService.signUpVerify(body)
  };

  @Post('upload')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async upLoad(@Body() body: InputUpLoad, @UploadedFile() video: Express.Multer.File, @Req() request: Request) {
    if (video) {
      body.user = request['user']
      body.video = video
      return await this.customerService.upVideo(body)
    }
  };

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
