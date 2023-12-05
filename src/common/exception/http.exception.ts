import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
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
        const customStatusCode = this.getCustomStatusCode(exception);
        console.log("errorHttpException:", error)
        if (customStatusCode === 4011) {
          return response.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
        } else { return response.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`); }
      default:
        this.render(response, 'home/index', {
          title: status,
          description: 'Page not found',
          message: error,
        });
    }
  };

  private getCustomStatusCode(exception: HttpException): number {
    // Custom logic to determine the status code based on the exception type
    if (exception.message === 'OTP not correct') {
      return 4011; // Custom code for OTP not correct
    } else if (exception.message === 'OTP is expired') {
      return 4012; // Custom code for OTP is expired
    }
    return 401; // Default code for other 401 errors
  }

  private render(res: Response, path: string, data?: object) {
    return res.render(path, data);
  }
}
