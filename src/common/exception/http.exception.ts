import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
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
      case HttpStatus.UNAUTHORIZED:
        return res.redirect(`/customer/sign-in?error=${encodeURIComponent(error)}`);
      case HttpStatus.FORBIDDEN:
        return res.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case HttpStatus.CONFLICT:
        return res.redirect(`/customer/sign-up?error=${encodeURIComponent(error)}`);
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return res.redirect(`/customer/verify-otp?error=${encodeURIComponent(error)}`);
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return { error }
      // const originalUrl = ctx.getRequest().url;
      // console.log("originalUrl:", originalUrl)
      // if (originalUrl && originalUrl !== '/') {
      //   redirectUrl = originalUrl;
      // } else {
      //   redirectUrl = '/';
      // }
      // break;
      case HttpStatus.NOT_IMPLEMENTED:
        return { error }
      default:
        return { mess: 'error' }
    }
    // if (redirectUrl) {
    //   console.log("redirectUrl:", redirectUrl)
    //   return res.redirect(redirectUrl);
    // } else {
    //   return this.render(res, 'error', { error });
    // }
  };

  // private render(res, path: string, data?: object) {
  //   return res.render(path, data);
  // }
}
