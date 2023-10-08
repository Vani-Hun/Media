import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { InputSetContact } from './contact.model';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Get()
  @Render('contact/index')
  get() {
    return this.contactService.get();
  }

  @Post()
  update(@Body() body: InputSetContact) {
    return this.contactService.update(body);
  }
}
