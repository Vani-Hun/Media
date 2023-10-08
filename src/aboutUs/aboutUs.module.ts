import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { storage } from 'src/common/utils/multer.config';
import { ContactModule } from 'src/contact/contact.module';
import { ProductModule } from 'src/product/product.module';
import { AboutUsController } from './aboutUs.controller';
import { AboutUs } from './aboutUs.entity';
import { AboutUsService } from './aboutUs.service';

@Module({
  imports: [
    MulterModule.register({ storage }),
    TypeOrmModule.forFeature([AboutUs]),
    ContactModule,
    forwardRef(() => ProductModule),
  ],
  controllers: [AboutUsController],
  providers: [AboutUsService],
  exports: [AboutUsService],
})
export class AboutUsModule {}
