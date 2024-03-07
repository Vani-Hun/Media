import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.message;
    let redirectUrl: string | undefined;
    console.log("status:", status, ", errorHttpException:", error)

    switch (status) {
      case 401:
        return res.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`);
      case 403:
        return res.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 409:
        return res.redirect(`/customer/sign-up?error=${encodeURIComponent(error)}`);
      case 422:
        return res.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case 500:
        const originalUrl = ctx.getRequest().url;
        console.log("originalUrl:", originalUrl)
        if (originalUrl && originalUrl !== '/') {
          redirectUrl = originalUrl;
        } else {
          redirectUrl = '/';
        }
        break;
      case 501:
        return { mess: 'error' }
      default:
        return { mess: 'error' }
    }
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    } else {
      return this.render(res, 'error', { error });
    }
  };

  private render(res, path: string, data?: object) {
    return res.render(path, data);
  }
}
