import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
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
        const cookie = request.cookies['accessToken'];
        let status: boolean;
        try {
            const customer: Customer = await this.tokenService.verify(cookie);
            status = await this.customerService.isExist(customer);
            request['user'] = await customer;
            return status;
            // if (!(await this.cacheService.getValue(admin.username))) {
            //     throw new UnauthorizedException('Let login!!!');
            // }
        } catch {
            console.log("catch")
            throw new UnauthorizedException('Let login!!!');
        }
    }
}
