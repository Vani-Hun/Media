import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    console.log("status:", status)
    const error = exception.message;

    switch (status) {
      case 422:
        console.log("errorHttpException:", error)
        return response.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 403:
        console.log("errorHttpException:", error)
        return response.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 401:
        console.log("errorHttpException:", error)
        return response.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`);
      case 409:
        console.log("errorHttpException:", error)
        return response.redirect(`/customer/sign-up?error=${encodeURIComponent(error)}`);
      case 500:
        console.log("errorHttpException:", error)
        return response.redirect(`/customer/profile`);
      default:
        this.render(response, 'home/index', {
          title: status,
          description: 'Page not found',
          message: error,
        });
    }
  };

  private render(res: Response, path: string, data?: object) {
    return res.render(path, data);
  }
}
