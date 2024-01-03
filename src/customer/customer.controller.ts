import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetAuth, InputSetCustomer, InputUpLoad, InputUpaDateVideo } from './customer.model';
import { CustomerService } from './customer.service';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
// import { interval, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

@Controller('customer')
export class CustomerController {
  constructor(private customerService: CustomerService) { }

  // @Sse('sse')
  // @UseGuards(CusAuthGuard)

  // sse(@Req() req): Observable<MessageEvent> {
  //   return new Observable(observer => {
  //     const fetchData = async () => {
  //       try {
  //         const data = await this.customerService.get(req['user']) // Hàm lấy dữ liệu
  //         console.log("data:", data)
  //         // observer.next({ data });
  //       } catch (error) {
  //         observer.error(error);
  //       }
  //     };

  //     const intervalId = setInterval(fetchData, 50000);
  //     console.log("intervalId:", intervalId)

  //     // Clean up interval when the connection is closed
  //     return () => clearInterval(intervalId);
  //   });
  // }

  // @Sse('sse')
  // sse(): Observable<MessageEvent> {
  //   return interval(1000).pipe(
  //     map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
  //   );
  // }

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
      return res.redirect('/video/videos')
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

  @Get('videos/like')
  @UseGuards(CusAuthGuard)
  async getVideoLiked(@Req() request: Request) {
    return await this.customerService.getVideoLiked(request['user'].id)
  }

  @Get('profile/:customerId')
  @UseGuards(CusAuthGuard)
  async getViewProfile(@Param('customerId') customerId: string, @Res() res: Response, @Req() request: Request) {
    return await this.customerService.getViewProfile(request['user'], customerId, res)
  };

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
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
  }

  @Get('setting/:customerId')
  @Render('customer/setting')
  getSetting() {
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
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
  }

  @Post('sign-in')
  async signIn(@Body() body: InputSetAuth, @Res() res: Response) {
    await this.customerService.signIn(body, res)
    return res.redirect('/video/videos');
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
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
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

  @Delete()
  async delete(@Body('id') id: string) {
    return await this.customerService.delete(id);
  }
}
