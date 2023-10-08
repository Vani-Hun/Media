import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.message;

    switch (status) {
      case 401:
        response.redirect(`/customer/sign-in?error=${error}`);
        break;
      default:
        this.render(response, 'pageError/index', {
          title: status,
          description: 'Page not found',
          message: error,
        });
    }
  }

  private render(res: Response, path: string, data?: object) {
    res.render(path, data);
  }
}
