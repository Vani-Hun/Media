import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./payment.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forFeature([Payment]),
        ConfigModule
    ],
    providers: [PaymentService],
    controllers: [],
    exports: [PaymentService],
})
export class PaymentModule { }