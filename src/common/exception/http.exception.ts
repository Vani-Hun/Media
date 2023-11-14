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
    console.log("status:", status)
    const error = exception.message;
    console.log("error:", error)

    switch (status) {
      case 401:
        return response.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`);
      default:
        this.render(response, 'home/index', {
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
