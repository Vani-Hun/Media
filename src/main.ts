import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { staticFolder, viewsFolder } from './common/utils/constant';
import { HttpExceptionFilter } from './common/exception/http.exception';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.setBaseViewsDir(viewsFolder);
  app.useStaticAssets(staticFolder);
  app.setViewEngine('ejs');
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT);
}
bootstrap()
