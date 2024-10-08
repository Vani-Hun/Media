import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetAuth, InputSetCustomer, InputUpLoad, InputUpaDateVideo } from './customer.model';
import { CustomerService } from './customer.service';

import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import * as moment from 'moment';
import { PaymentService } from 'src/payment/payment.service';


@Controller('customer')
export class CustomerController {
  constructor(
    private customerService: CustomerService,
    private paymentService: PaymentService,

  ) { }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res) {
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
  async getVideosLiked(@Req() request: Request) {
    return await this.customerService.getUser(request['user'])
  }

  @Get('videos/like/:customerId')
  @UseGuards(CusAuthGuard)
  async getVideosLikedFromViewer(@Req() request: Request, @Param('customerId') customerId: string) {
    if (customerId !== request['user'].id) {
      request['user'].id = customerId
      let customer = await this.customerService.getUser(request['user'])
      if (customer.video_liked_status) {
        return customer
      }
    }
    return await this.customerService.getUser(request['user'])
  }

  @Get('profile/:customerId')
  @UseGuards(CusAuthGuard)
  async getViewProfile(@Param('customerId') customerId: string, @Res() res: Response, @Req() request: Request) {
    request['user'].customerId = customerId
    return await this.customerService.getViewProfile(request['user'], res)
  };

  @Post('profile/update')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(@UploadedFile() avatar: Express.Multer.File, @Body() body: InputSetCustomer, @Req() request: Request) {
    request['user'] = { ...request['user'], ...body, avatar }
    return await this.customerService.postProfile(request['user'])
  }
  @Post('profile/upgrade')
  @UseGuards(CusAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async upgradeProfile(@Body() body, @Req() request: Request) {
    request['user'] = { ...request['user'], ...body }
    return await this.customerService.postUpgradeProfile(request['user'])
  }
  @Post('follow/:customerId')
  @UseGuards(CusAuthGuard)
  async followUser(@Req() request: Request, @Param('customerId') customerId: string) {
    request['user'].customerId = customerId
    return await this.customerService.followUser(request['user'])
  }

  @Post('unfollow/:customerId')
  @UseGuards(CusAuthGuard)
  async unfollowUser(@Req() request: Request, @Param('customerId') customerId: string) {
    request['user'].customerId = customerId
    return await this.customerService.unfollowUser(request['user'])
  }

  @Get('sign-in')
  @Render('customer/sign-in')
  getSignin(@Query('error') error: string) {
    if (error) {
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
  }

  @Get('setting')
  @UseGuards(CusAuthGuard)
  @Render('customer/setting')
  async getSetting(@Req() request: Request,) {
    const customer = await this.customerService.getUser(request['user'])
    return { customer }
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
    return await this.customerService.signIn(body, res)
  }

  @Post('sign-up')
  async signUp(@Body() body: InputSetAuth, @Res() res: Response) {
    return await this.customerService.signUp(body, res)
  }

  @Get('verify-otp')
  @Render('customer/sign-up-otp')
  async getVerifyOtp(@Query('error') error: string) {
    if (error) {
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body, @Res() res: Response, @Req() request: Request) {
    // const hashedOTP = request.cookies['hashedOTP']
    const username = request.cookies['username']
    const phone = request.cookies['phone']
    const hashedPassword = request.cookies['hashedPassword']
    body = { ...body, username, phone, hashedPassword }
    // body.username = username
    // body.phone = phone
    // body.hashedPassword = hashedPassword
    return await this.customerService.signUpVerify(body)
  };

  @Delete()
  async delete(@Body('id') id: string) {
    return await this.customerService.delete(id);
  }
  @Get('payment')
  @UseGuards(CusAuthGuard)
  @Render('customer/payment')
  async getPaymentPage(@Req() request: Request,) {
    const customer = await this.customerService.getUser(request['user'])
    return { customer, payment: null }
  }
  @Post('create_payment_url')
  @UseGuards(CusAuthGuard)
  createPayment(@Req() req, @Res() res: Response, @Body() body: any) {
    const orderId = moment().format('DDHHmmss');
    const amount = body.amount;
    const orderInfo = `Thanh toan cho ma GD:${orderId}`;
    const ipAddr = req.ip || req.connection.remoteAddress || '';
    const bankCode = body.bankCode
    const paymentUrl = this.paymentService.createPaymentUrl(orderId, amount, orderInfo, ipAddr, bankCode);
    return res.redirect(paymentUrl)
  }
  @Post('querydr')
  @UseGuards(CusAuthGuard)
  async createQueryDR(@Req() req, @Res() res: Response, @Body() body: any) {
    const customer = await this.customerService.getUser(req['user']);
    const payment = await this.paymentService.createQueryDR(body.orderId, body.transDate, '');
    return res.render('customer/payment', {
      customer,
      payment
    });
  }
  @Post('refund')
  @UseGuards(CusAuthGuard)
  createRefund(@Req() req, @Res() res: Response, @Body() body: any) {

  }
  @Get('vnpay-return')
  @UseGuards(CusAuthGuard)
  async vnpayReturn(@Query() query, @Req() request: Request, @Res() res: Response) {
    const vnpParams = query;
    let isExistPayment = await this.paymentService.checkPaymentExist(vnpParams, request['user']);
    if (isExistPayment) {
      const customer = await this.customerService.getUser(request['user'])
      return res.render('customer/payment', {
        customer,
        payment: null
      });
    }
    const isValidSignature = this.paymentService.verifyReturnUrl(vnpParams);

    const vnp_ResponseCode = vnpParams['vnp_ResponseCode'];
    let updateAmount = 0;
    if (isValidSignature) {
      if (vnp_ResponseCode === '00') {
        vnpParams['vnp_Message'] = 'Thanh toán thành công';
        updateAmount = +vnpParams['vnp_Amount'];
      } else {
        vnpParams['vnp_Message'] = 'Thanh toán thất bại';
      }
    } else {
      vnpParams['vnp_Message'] = 'Chữ ký không hợp lệ';
    }

    const customer = await this.customerService.updateCoin(request['user'], updateAmount);
    const payment = await this.paymentService.savePaymentTransaction(vnpParams, request['user']);

    return res.render('customer/payment', {
      customer,
      payment
    });
  }

  @Get('vnpay_ipn')
  @UseGuards(CusAuthGuard)
  vnpayIPN(@Query() query, @Res() res: Response) {
    const vnpParams = query;
    console.log("vnpParamsIPN:", vnpParams)

    const isValidSignature = this.paymentService.verifyIPN(vnpParams);
    console.log("isValidSignature:", isValidSignature)
  }
}
