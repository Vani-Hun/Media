import { Notification } from 'src/notification/notitfication.entity';
import { NotificationService } from './notification.service';
import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
// import { interval, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

@Controller('notification')
export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    @UseGuards(CusAuthGuard)
    @Post('check')
    async checkNotification(@Req() request: Request) {
        return this.notificationService.checkNotification(request['user'].id);
    }

    // @Get()
    // async get() {
    //     return this.notificationService.post();
    // }

    // @Sse('sse')
    // sse(): Observable<MessageEvent> {
    //   return interval(1000).pipe(
    //     map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
    //   );
    // }

    ;
}
