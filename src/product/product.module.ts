import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from 'src/contact/contact.module';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProjectModule } from 'src/project/project.module';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/multer.config';
import { AboutUsModule } from 'src/aboutUs/aboutUs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ContactModule,
    ProjectModule,
    MulterModule.register({ storage }),
    forwardRef(() => AboutUsModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
