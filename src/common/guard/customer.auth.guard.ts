import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Admin } from 'src/admin/admin.entity';
import { CustomerService } from 'src/customer/customer.service';
import { CacheService } from '../services/cache.service';
import { TokenService } from '../services/token.service';
import { Customer } from 'src/customer/customer.entity';

@Injectable()
export class CusAuthGuard implements CanActivate {
    constructor(
        private customerService: CustomerService,
        private tokenService: TokenService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = await context.switchToHttp().getRequest<Request>();
        const accessToken = request.cookies['accessToken'];
        let status: boolean;
        try {
            const customer: Customer = await this.tokenService.verify(accessToken)
            status = await this.customerService.isExist(customer);
            if (status) {
                request['user'] = await customer;
            } else {
                throw new HttpException('Let login!!!', HttpStatus.UNAUTHORIZED);
            }
            return status;
        } catch {
            console.log("catchcanActivate")
            throw new UnauthorizedException('Let login!!!');
        }
    }
}
