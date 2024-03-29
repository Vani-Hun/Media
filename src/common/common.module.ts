import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from 'src/admin/admin.module';
import { CacheService } from './services/cache.service';
import { TokenService } from './services/token.service';
import { CustomerModule } from 'src/customer/customer.module';
import { GoogleStrategy } from './services/google.service';
import { PassportModule } from '@nestjs/passport';
import { FacebookStrategy } from './services/facebook.service';
import { SmsService } from './services/twilio.service';
import { NotificationGateway } from './services/websocket.service';
import { VideoModule } from 'src/video/video.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { HashtagModule } from 'src/hashtag/hashtag.module';
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
    strategies: ['google', 'facebook'],
    session: true,
  }),
  inject: [ConfigService],
})

@Module({
  imports: [PportModule, TokenModule, CacheModule.register(), forwardRef(() => AdminModule), forwardRef(() => CustomerModule), forwardRef(() => NotificationModule), forwardRef(() => VideoModule), forwardRef(() => ConversationModule)],
  providers: [CacheService, TokenService, GoogleStrategy, FacebookStrategy, SmsService, NotificationGateway],
  exports: [CacheService, TokenService, FacebookStrategy, SmsService, NotificationGateway],
})
export class CommonModule { }
