import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from 'src/admin/admin.module';
import { AuthGuard } from './guard/auth.guard';
import { CacheService } from './services/cache.service';
import { TokenService } from './services/token.service';
import { CustomerModule } from 'src/customer/customer.module';
import { GoogleStrategy } from './services/passport.service';
import { PassportModule } from '@nestjs/passport';
// import { AppGateway } from './services/websocket.service';
const TokenModule = JwtModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: {
      algorithm: 'HS256',
    },
  }),
  inject: [ConfigService],
});

const PportModule = PassportModule.registerAsync({
  useFactory: async (configService: ConfigService) => ({
    defaultStrategy: 'google',
    session: true,
  }),
  inject: [ConfigService],
})

@Module({
  imports: [PportModule, TokenModule, CacheModule.register(), forwardRef(() => AdminModule), forwardRef(() => CustomerModule)],
  providers: [CacheService, TokenService, GoogleStrategy],
  exports: [CacheService, TokenService],
})
export class CommonModule { }
