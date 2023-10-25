import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Video } from 'src/video/video.entity';
@Entity()
export class Customer extends BaseEntityUUID {
  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 0 })
  followers: number;

  @Column({ default: 0 })
  likes: number;

  @Column()
  username: string;

  @Column({ nullable: true })
  bio: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  permission: string;

  @OneToMany(() => Video, video => video.user, {
    cascade: true, // Tùy chọn này để tự động lưu video khi lưu customer
    eager: true, // Tùy chọn này để tự động load video khi truy vấn customer
  })
  videos: Video[];
}
