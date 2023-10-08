import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Render,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InputSetProduct } from './product.model';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @Render('product/index')
  get() {
    return this.productService.getRequest();
  }

  @Get(':productid')
  @Render('product/index')
  getDetail(@Param('productid') productID: string) {
    return this.productService.getRequest({ productID });
  }

  @Get(':productid/:projectid')
  @Render('product-detail/index')
  async getDetailProduct(@Param() params) {
    return this.productService.getRequest({
      productID: params.productid,
      projectID: params.projectid,
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  post(
    @Body() body: InputSetProduct,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    if (banner) {
      body.banner = banner;
    }
    if (body.id) {
      return this.productService.update(body);
    }
    return this.productService.create(body);
  }

  @Delete()
  delete(@Body('id') id: string) {
    return this.productService.delete(id);
  }
}
