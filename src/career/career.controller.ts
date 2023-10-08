import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Redirect, Render, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetApplicant } from 'src/applicant/applicant.model';
import { ApplicantService } from 'src/applicant/applicant.service';
import { MoreThan } from 'typeorm';
import { CareerService } from './career.service';

@Controller('career')
export class CareerController {
    constructor(
        private careerService: CareerService,
        private applicantService: ApplicantService
    ) { }

    @Get(':id')
    @Render('career-detail/index')
    async get(@Param('id') id: string) {
        const [career, contact] = await Promise.all([
            this.careerService.get(id, {
                where: { expired: MoreThan(new Date()) }
            }),
            this.careerService.getContact()
        ])
        if (career)
            return { career, contact }
        throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }

    @Get()
    @Render('career/index')
    async getAllActive() {
        const [careers, contact] = await Promise.all([
            this.careerService.getAll({
                where: { expired: MoreThan(new Date()) }
            }),
            this.careerService.getContact()
        ])
        return { careers, contact, error: '' }
    }

    @Post()
    @Render('career/index')
    @UseInterceptors(FileInterceptor('cv'))
    async submitCV(@UploadedFile() file, @Body() body: InputSetApplicant) {
        let error: string = ''
        const isSuccess = await this.applicantService.submitCV(file, body)
        if (isSuccess) {
            error = `Congratulations successful job application at ${body.position}`
            await this.applicantService.create(body)
        }
        else error = 'Submit failed'
        const ret = await this.getAllActive()
        return { careers: ret.careers, contact: ret.contact, error }
    }
}
