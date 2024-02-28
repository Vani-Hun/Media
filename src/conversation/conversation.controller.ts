
import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConversationService } from './conversation.service';

@Controller('conversation')
export class ConversationController {
    constructor(private conversationService: ConversationService) { }

    @Get('list')
    @UseGuards(CusAuthGuard)
    async getList(@Req() request: Request) {
        return await this.conversationService.getList(request['user'])
    }
}
