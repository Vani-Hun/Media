import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/services/base.service';
import { Repository } from 'typeorm';
import { Applicant } from './applicant.entity';
import { InputSetApplicant } from './applicant.model';
import { CareerService } from 'src/career/career.service';
const nodemailer = require('nodemailer')
import { MailboxService } from 'src/mailbox/mailbox.service';
import { MoreThan } from 'typeorm';
@Injectable()
export class ApplicantService extends BaseService<Applicant> {
    constructor(
        @InjectRepository(Applicant) repo: Repository<Applicant>,
        @Inject(forwardRef(() => CareerService))
        private careerService: CareerService,
        private mailboxService: MailboxService) {
        super(repo);
    }

    async create(input: InputSetApplicant) {
        const career = input.careerID ? await this.careerService.get(input.careerID) : null
        if (career) {
            input.position = career.position
        }
        console.log('1111', career)
        const applicant = this.repo.create({
            ...input,
            // career,
        })
        return this.repo.save(applicant)
    }
    async submitCV(file, input: InputSetApplicant) {
        try {
            const career = input.position ? await this.careerService.get(input.position, {
                where: { position: input.position }
            }) : null
            console.log('2222', career)
            if (career) {
                input.position = career.position
            }
            const mailboxInfo = await this.mailboxService.get()
            if (mailboxInfo) {
                // create transporter
                const transporter = nodemailer.createTransport({
                    service: mailboxInfo.service_autoMail,
                    auth: {
                        user: mailboxInfo.autoMail,
                        pass: mailboxInfo.pw_autoMail,
                    }
                })
                // config for email to HR team
                const subjectToHR = mailboxInfo.titleToHR.replace('#name#', input.name).replace('#position#', input.position)
                const contentToHR = mailboxInfo.contentToHR.replace('#name#', input.name).replace('#email#', input.email).replace('#phone#', input.phone).replace('#position#', input.position)
                const optionsToHR = {
                    to: mailboxInfo.hrMailbox,
                    from: mailboxInfo.autoMail,
                    subject: subjectToHR,
                    text: contentToHR,
                    attachments: [{
                        filename: file.originalname,
                        contentType: file.mimetype,
                        content: file.buffer,
                    }]
                }
                // config for email to Candidate
                const contentToCandidate = mailboxInfo.contentToCandidate.replace('#name#', input.name).replace('#position#', input.position)
                const optionsToCandidate = {
                    to: input.email,
                    from: mailboxInfo.autoMail,
                    subject: mailboxInfo.titleToCandidate,
                    text: contentToCandidate
                }
                // send email
                const sendToHR = transporter.sendMail(optionsToHR)
                const sendToCandidate = transporter.sendMail(optionsToCandidate)
                return Promise.all([sendToHR, sendToCandidate]).then(() => { return true; }).catch((error) => { console.log(error); return false; });
            }
            throw new HttpException('No infomation about HR mailbox', 500)
        } catch (error) {
            throw new HttpException(error.message, 500)
        }
    }
}