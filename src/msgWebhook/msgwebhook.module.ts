import { Module } from "@nestjs/common";
import { MsgWebhookController } from "./msgwebhook.controller";
import { MsgWebhookService } from "./msgwebhook.service";

@Module({
    controllers: [MsgWebhookController],
    providers: [MsgWebhookService]
})
export class MsgWebhookModule {}