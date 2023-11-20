import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { JoinTable, Column, Entity, OneToMany, ManyToMany } from 'typeorm';
import { Video } from 'src/video/video.entity';
import { Comment } from 'src/comment/comment.entity';
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

  @OneToMany(() => Video, video => video.user)
  videos: Video[];

  @OneToMany(() => Comment, comment => comment.customer)
  comments: Comment[];

  @ManyToMany(() => Video, video => video.likers)
  @JoinTable({ name: 'likedVideos', })
  likedVideos: Video[];


}
