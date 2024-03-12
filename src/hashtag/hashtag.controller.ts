
import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { HashtagService } from './hashtag.service';

@Controller('hashtag')
export class HashtagController {
    constructor(private hashtagService: HashtagService) { }

    @Get('/:nameHashTag')
    @UseGuards(CusAuthGuard)
    async getHashTag(@Req() request: Request, @Param('nameHashTag') nameHashTag: string) {
        request['user'].nameHashTag = nameHashTag
        return await this.hashtagService.getHashTags(request['user'])
    }

    @Get('/:nameHashTag/videos')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getHashTagVideos(@Req() request: Request, @Param('nameHashTag') nameHashTag: string) {
        request['user'].nameHashTag = nameHashTag
        return await this.hashtagService.getHashTagVideos(request['user'])
    }
}
