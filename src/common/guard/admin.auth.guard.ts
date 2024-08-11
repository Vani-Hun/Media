import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Admin } from 'src/admin/admin.entity';
import { CustomerService } from 'src/customer/customer.service';
import { CacheService } from '../services/cache.service';
import { TokenService } from '../services/token.service';
import { Customer } from 'src/customer/customer.entity';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies['accessTokenAdmin'];
    let status: boolean;
    try {
      const admin: Admin = await this.tokenService.verify(accessToken)
      console.log("admin:", admin)
      status = await this.adminService.isExist(admin);
      console.log("status:", status)
      if (status) {
        request['user'] = await admin;
      } else {
        throw new HttpException('Failed.', HttpStatus.SERVICE_UNAVAILABLE);
      }
      return status;
    } catch {
      console.log("catchcanActivate")
      throw new HttpException('Failed.', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }
}
