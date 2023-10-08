import { Body, Controller, Delete, Post } from '@nestjs/common';
import { InputSetPersonnel } from './personnel.model';
import { PersonnelService } from './personnel.service';

@Controller('personnel')
export class PersonnelController {
  constructor(private personnelService: PersonnelService) {}

  @Post()
  post(@Body() body: InputSetPersonnel) {
    if (body.id) {
      return this.personnelService.update(body);
    }
    return this.personnelService.create(body);
  }

  @Delete()
  delete(@Body('id') id: string) {
    return this.personnelService.delete(id);
  }
}
