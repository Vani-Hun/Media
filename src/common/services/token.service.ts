import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) { }

  sign(payload: string | object | Buffer) {
    console.log('payload:', payload)
    let secret: string = "vani"
    return this.jwtService.sign(payload, { secret });
  }

  verify(token: string) {
    let secret: string = "vani"
    return this.jwtService.verify(token, { secret });

  }
}
