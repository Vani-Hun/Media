import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Query } from "@nestjs/common";
import { MsgWebhookService } from "./msgwebhook.service";

@Controller('msgwebhook')
export class MsgWebhookController {
    constructor(private msgWebhookService: MsgWebhookService) { }

    @Get('webhook')
    @HttpCode(200)
    whget(@Query() query: Object) {
        let VERIFY_TOKEN = process.env.VERIFY_FB_TOKEN;

        // Parse the query params
        let mode = query['hub.mode'];
        let token = query['hub.verify_token'];
        let challenge = query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {

            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {

                // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                return challenge

            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                throw new HttpException('verify token do not match', HttpStatus.FORBIDDEN)
            }
        }
    }

    @Post('webhook')
    @HttpCode(200)
    whpost(@Body() body) {
        // Check the webhook event is from a Page subscription
        console.log(body)
        if (body.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            body.entry.forEach(function (entry) {

                // Gets the body of the webhook event
                let webhook_event = entry.messaging[0];
                console.log(webhook_event);


                // Get the sender PSID
                let sender_psid = webhook_event.sender.id;
                console.log('Sender PSID: ' + sender_psid);

                // Check if the event is a message or postback and
                // pass the event to the appropriate handler function
                if (webhook_event.message) {
                    this.msgWebhookService.handleMessage(sender_psid, webhook_event.message);
                } else if (webhook_event.postback) {
                    this.msgWebhookService.handlePostback(sender_psid, webhook_event.postback);
                }

            });
            return 'EVENT_RECEIVED'

        } else {
            // Return a '404 Not Found' if event is not from a page subscription
            throw new HttpException('Not found', HttpStatus.NOT_FOUND)
        }
    }
}