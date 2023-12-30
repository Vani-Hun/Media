import { Body, Controller, Get, Post, Render, Sse } from '@nestjs/common';
import { InputSetHome } from './home.model';
import { HomeService } from './home.service';
import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Controller(['/home', '/'])
export class HomeController {
  constructor(private homeService: HomeService) { }

  @Get()
  @Render('home/index')
  async get() {
    return { customer: null }
    // return this.homeService.getHome();
  }
  // @Sse('sse')
  // sse(): Observable<MessageEvent> {
  //   return interval(1000).pipe(
  //     map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
  //   );
  // }

  @Post()
  post(@Body() body: InputSetHome) {
    // return this.homeService.update(body);
  }


}
