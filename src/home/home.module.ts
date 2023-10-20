import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactModule } from 'src/contact/contact.module';
import { HomeController } from './home.controller';
import { Home } from './home.entity';
import { HomeService } from './home.service';

@Module({
  imports: [ContactModule, TypeOrmModule.forFeature([Home])],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule { }
