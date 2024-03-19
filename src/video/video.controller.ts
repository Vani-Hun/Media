
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
    async getUpload(@Req() req: Request) {
        return await this.videoService.getUploadVideo(req['user'])
    }

    @Post('upload')
    @UseGuards(CusAuthGuard)
    @UseInterceptors(FileInterceptor('video'))
    async upLoad(@Body() body, @UploadedFile() video: Express.Multer.File, @Req() req: Request, @Res() res: Response) {
        if (video) {
            req['user'] = { ...req['user'], ...body, video }
            const url = await this.videoService.uploadVideo(req['user'])
            if (url) {
                req['user'].image = ""
                return await this.videoService.create(url, req['user'], res)
            }
        }
    }

    @Get('videos')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideos(@Req() req: Request) {
        return await this.videoService.getVideos(req['user'])
    }

    @Get('following')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideosFollowing(@Req() req: Request) {
        return await this.videoService.getVideosFollowing(req['user'])
    }

    @Get('friends')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideosFriends(@Req() req: Request) {
        return await this.videoService.getVideosFriends(req['user'])
    }


    @Get('videos/inf')
    @UseGuards(CusAuthGuard)
    async getVideosInf(@Req() req: Request) {
        return await this.videoService.getVideos(req['user'])
    }

    @Get('search')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideosFromKeyword(@Query('keyword') keyword: string, @Req() req: Request): Promise<any> {
        req['user'] = { ...req['user'], keyword };
        return await this.videoService.getVideosFromKeyword(req['user']);
    }

    @Get(':videoId')
    @UseGuards(CusAuthGuard)
    @Render('video/index')
    async getVideoById(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.getVideoById(req['user'])
    };

    @Get('videoInf/:id')
    @UseGuards(CusAuthGuard)
    async getVideo(@Param('id') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.getVideoById(req['user'])
    }

    @Post('view/:videoId')
    @UseGuards(CusAuthGuard)
    async viewVideo(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.updateView(req['user'])
    }

    @Post('like/:videoId')
    @UseGuards(CusAuthGuard)
    async likeVideo(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.updateLike(req['user'])
    };

    @Post('dislike/:videoId')
    @UseGuards(CusAuthGuard)
    async dislikeVideo(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.updateDisLike(req['user'])
    }

    @Post('share/:videoId')
    @UseGuards(CusAuthGuard)
    async shareVideo(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.updateShare(req['user'])
    };

    @Post('comment/:videoId')
    @UseGuards(CusAuthGuard)
    async commentVideo(@Body() body, @Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId, mess: body.mess }
        return await this.videoService.createComment(req['user'])
    }


    @Post('update')
    @UseGuards(CusAuthGuard)
    async updateVideo(@Body() body, @Req() req: Request) {
        if (body) {
            req['user'] = { ...req['user'], ...body }
            return await this.videoService.update(req['user'])
        }
    }
    @Delete('delete/:videoId')
    @UseGuards(CusAuthGuard)
    async deleteVideo(@Param('videoId') videoId: string, @Req() req: Request) {
        req['user'] = { ...req['user'], videoId }
        return await this.videoService.delete(req['user'])
    }
}
