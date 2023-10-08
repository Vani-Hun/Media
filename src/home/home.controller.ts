import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { InputSetHome } from './home.model';
import { HomeService } from './home.service';

@Controller(['', 'home'])
export class HomeController {
  constructor(private homeService: HomeService) { }

  @Get()
  @Render('home/index')
  async get() {
    return this.homeService.getHome();
  }

  @Post()
  post(@Body() body: InputSetHome) {
    return this.homeService.update(body);
  }
}
