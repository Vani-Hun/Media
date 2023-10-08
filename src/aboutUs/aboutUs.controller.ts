import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { InputSetAboutUs } from './aboutUs.model';
import { AboutUsService } from './aboutUs.service';

@Controller('aboutus')
export class AboutUsController {
  constructor(private aboutUsService: AboutUsService) {}

  @Get()
  @Render('aboutUs/index')
  get() {
    return this.aboutUsService.getPage({
      relations: ['personnels', 'departments'],
    });
  }

  @Post()
  post(@Body() body: InputSetAboutUs) {
    return this.aboutUsService.update(body);
  }
}
