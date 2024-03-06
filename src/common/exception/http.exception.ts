import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.message;
    console.log("status:", status, ", errorHttpException:", error)
    switch (status) {
      case 401:
        return response.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`);
      case 403:
        return response.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 409:
        return response.redirect(`/customer/sign-up?error=${encodeURIComponent(error)}`);
      case 422:
        return response.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 500:
        return response.redirect(`/`);
      case 501:
        return { mess: 'error' }
      default:
        return { mess: 'error' }
    }
  };

  private render(res: Response, path: string, data?: object) {
    return res.render(path, data);
  }
}
