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
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { AdminAuthGuard } from 'src/common/guard/admin.auth.guard';
import { InputSetCustomer } from 'src/customer/customer.model';
import { InputSetHome } from 'src/home/home.model';
import { InputSetLogin, InputSetRegister } from './admin.model';
import { AdminService } from './admin.service';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Get('sign-in')
  @Render('admin/sign-in')
  getSignin(@Query('error') error: string) {
    if (error) {
      return { message: error, customer: null };
    }
    return { message: null, customer: null };
  }

  @Get('message')
  @Render('admin/message')
  @UseGuards(AdminAuthGuard)
  async getMessage(@Req() request) {
    return await this.adminService.getAdminByAdmin(request['user'])
  }

  @Post('sign-in')
  async signIn(@Body() body, @Res() res: Response) {
    return await this.adminService.signIn(body, res)

  }
}
