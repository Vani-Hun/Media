import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Home extends BaseEntity {
  @Column({ type: 'text' })
  introduction: string;

  @Column({ type: 'text' })
  slogan: string;
}
