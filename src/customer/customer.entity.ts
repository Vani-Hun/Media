import { Delete } from '@nestjs/common';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { JoinTable, Column, Entity, OneToMany, ManyToMany, AfterInsert, PrimaryColumn, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Video } from 'src/video/video.entity';
import { Comment } from 'src/comment/comment.entity';
import { Notification } from 'src/notification/notitfication.entity';
@Entity()
export class Customer extends BaseEntityUUID {

  @Column({ nullable: true })
  logo?: string;

  @Column({ nullable: true })
  name: string;

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

  @ManyToMany(() => Customer, { cascade: true })
  @JoinTable({
    name: 'follower_following',
    joinColumn: {
      name: 'follower_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'following_id',
      referencedColumnName: 'id',
    },
  })
  followers: Customer[];

  @ManyToMany(() => Customer, { cascade: true })
  @JoinTable({
    name: 'follower_following',
    joinColumn: {
      name: 'following_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'follower_id',
      referencedColumnName: 'id',
    },
  })
  following: Customer[];

  @Column({ default: 0 })
  likes: number;

  @OneToMany(() => Video, video => video.user, { cascade: true })
  videos: Video[];

  @OneToMany(() => Notification, notification => notification.user, { cascade: true })
  notifications: Notification[];

  @OneToMany(() => Comment, comment => comment.customer, { cascade: true })
  comments: Comment[];

  @ManyToMany(() => Video, video => video.likers, { cascade: true })
  likedVideos: Video[];

};
