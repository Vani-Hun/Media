import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Admin } from 'src/admin/admin.entity';
import { AdminService } from 'src/admin/admin.service';
import { CacheService } from '../services/cache.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private adminService: AdminService,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const cookie = request.cookies['gpt_admin'];

    let status: boolean;

    try {
      const admin: Admin = this.tokenService.verify(cookie);
      status = await this.adminService.isExist(admin);

      if (!(await this.cacheService.getValue(admin.username))) {
        throw new UnauthorizedException('Let login!!!');
      }
    } catch {
      throw new UnauthorizedException('Let login!!!');
    }

    return true;
  }
}
