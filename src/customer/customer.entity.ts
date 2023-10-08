import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Video } from 'src/video/video.entity';
@Entity()
export class Customer extends BaseEntityUUID {
  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  permission: string;

  @OneToMany(() => Video, video => video.user)
  videos: Video[];
}
