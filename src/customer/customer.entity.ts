import { Delete } from '@nestjs/common';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { JoinTable, Column, Entity, OneToMany, ManyToMany, AfterInsert } from 'typeorm';
import { Video } from 'src/video/video.entity';
import { Comment } from 'src/comment/comment.entity';
import { Notification } from 'src/notification/notitfication.entity';
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
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  permission: string;

  @OneToMany(() => Video, video => video.user)
  videos: Video[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Comment, comment => comment.customer)
  comments: Comment[];

  @ManyToMany(() => Video, video => video.likers)
  likedVideos: Video[];

};
