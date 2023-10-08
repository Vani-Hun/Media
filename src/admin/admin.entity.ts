import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Admin extends BaseEntityUUID {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  permission: string;
}
