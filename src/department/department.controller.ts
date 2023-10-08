import { Body, Controller, Delete, Post } from '@nestjs/common';
import { InputSetDepartment } from './department.model';
import { DepartmentService } from './department.service';

@Controller('department')
export class DepartmentController {
  constructor(private deparmentService: DepartmentService) {}

  @Post()
  post(@Body() body: InputSetDepartment) {
    if (body.id) {
      return this.deparmentService.update(body);
    }
    return this.deparmentService.create(body);
  }

  @Delete()
  delete(@Body('id') id: string) {
    return this.deparmentService.delete(id);
  }
}
