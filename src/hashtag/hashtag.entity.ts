import { Notification } from '../notification/notitfication.entity';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Conversation } from 'src/conversation/conversation.entity';
import { Video } from 'src/video/video.entity';


@Entity()
export class Hashtag extends BaseEntityUUID {
    @Column({ nullable: false })
    name: string;

    @Column({ default: 0 })
    usage: number;

    @ManyToMany(() => Video, video => video.hashtags, { cascade: true })
    videos: Video[];
}
