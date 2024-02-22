// sms.service.ts
import { HttpException, HttpStatus } from '@nestjs/common';
import * as twilio from 'twilio';

export class SmsService {
    private twilioClient: twilio.Twilio;

    constructor() {
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendOtpViaSms(phoneNumber: string, otp: string): Promise<void> {
        try {
            const message = await this.twilioClient.messages.create({
                body: `Your OTP is: ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
            });
            // const verification = await this.twilioClient.verify.v2.services(
            //     process.env.TWILIO_VERIFY_SERVICE_SID
            // ).verifications.create({
            //     to: phoneNumber,
            //     channel: 'sms'
            // });

            // console.log('Verification SID:', verification.sid);
            // console.log('SMS sent:', message.sid);
        } catch (error) {
            console.error(error);
            throw new HttpException(`Error sending SMS please try again`, HttpStatus.CONFLICT);
        }
    }
}
