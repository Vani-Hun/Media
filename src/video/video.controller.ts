
import { Sse, Body, Controller, Delete, Get, Post, Render, UploadedFile, UseInterceptors, Query, Redirect, UseGuards, Res, Req, Param, HttpStatus } from '@nestjs/common';
import { CusAuthGuard } from 'src/common/guard/customer.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
    constructor(private videoService: VideoService) { }

    @Get('upload')
    @UseGuards(CusAuthGuard)
    @Render('video/upload')
    async getUpload(@Req() request: Request) {
        return await this.videoService.getUploadVideo(request['user'].id)
    }

    @Post('upload')
    @UseGuards(CusAuthGuard)
    @UseInterceptors(FileInterceptor('video'))
    async upLoad(@Body() body, @UploadedFile() video: Express.Multer.File, @Req() request: Request) {
        if (video) {
            body.user = request['user']
            body.video = video
            const url = await this.videoService.uploadVideo(body)
            if (url) {
                return await this.videoService.create(url, body)
            }
        }
    };
    @Get('videos')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideos(@Req() request: Request) {
        return await this.videoService.get(request['user'].id)
    }

    @Get(':videoId')
    @UseGuards(CusAuthGuard)
    @Render('video/detail')
    async getVideoById(@Param('videoId') videoId: string, @Req() request: Request) {
        return await this.videoService.getVideoById(videoId, request['user'].id)
    }

    @Get('videoInf/:id')
    @UseGuards(CusAuthGuard)
    async getVideo(@Param('id') videoId: string, @Req() request: Request) {
        return await this.videoService.getVideoById(videoId, request['user'].id)
    }
    @Post('view/:videoId')
    @UseGuards(CusAuthGuard)
    async viewVideo(@Param('videoId') videoId: string, @Req() request: Request) {
        return await this.videoService.updateView(videoId, request['user'].id)
    }

    @Post('like/:videoId')
    @UseGuards(CusAuthGuard)
    async likeVideo(@Param('videoId') videoId: string, @Req() request: Request) {
        const input = {
            user: request['user'],
            videoId: videoId
        }
        return await this.videoService.updateLike(videoId, request['user'].id)
    };

    @Post('dislike/:videoId')
    @UseGuards(CusAuthGuard)
    async dislikeVideo(@Param('videoId') videoId: string, @Req() request: Request) {
        const input = {
            user: request['user'],
            videoId: videoId
        }
        return await this.videoService.updateDisLike(videoId, request['user'].id)
    }

    @Post('share/:videoId')
    @UseGuards(CusAuthGuard)
    async shareVideo(@Param('videoId') videoId: string, @Req() request: Request) {
        const input = {
            user: request['user'],
            videoId: videoId
        }
        return await this.videoService.updateShare(videoId)
    };

    @Post('comment/:videoId')
    @UseGuards(CusAuthGuard)
    async commentVideo(@Body() body, @Param('videoId') videoId: string, @Req() request: Request) {
        const input = {
            user: request['user'],
            videoId: videoId,
            mess: body.mess
        }
        return await this.videoService.createComment(input)
    }


    @Post('update')
    @UseGuards(CusAuthGuard)
    async updateVideo(@Body() body, @Req() request: Request) {
        if (body) {
            body.user = request['user']
            return await this.videoService.update(body)
        }
    }
    @Delete('delete/:videoId')
    @UseGuards(CusAuthGuard)
    async deleteVideo(@Param('videoId') videoId: string, @Req() request: Request) {
        return await this.videoService.delete(videoId, request['user'].id)
    }
}
