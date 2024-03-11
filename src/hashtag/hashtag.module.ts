import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashtagController } from './hashtag.controller';
import { Hashtag } from './hashtag.entity';
import { HashtagService } from './hashtag.service';
import { CommonModule } from 'src/common/common.module';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
    imports: [
        forwardRef(() => CustomerModule),
        forwardRef(() => CommonModule),
        TypeOrmModule.forFeature([Hashtag]),
    ],
    providers: [HashtagService],
    controllers: [HashtagController],
    exports: [HashtagService],
})
export class HashtagModule { }
