import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Video } from '../video/video.entity'; // Import Video Entity

@Entity()
export class Comment extends BaseEntityUUID {
    @Column()
    content: string;

    @Column({ default: 0 }) // Số lượt like của comment, mặc định là 0
    likes: number;

    @ManyToOne(() => Video, video => video.comments)
    video: Video;

    @ManyToOne(() => Comment, comment => comment.replies)
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];
}
