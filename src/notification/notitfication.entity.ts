import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Video } from 'src/video/video.entity';

export enum NotificationType {
    LIKE = 'Likes',
    COMMENT = 'Comments',
    MENTIONS_AND_TAGS = 'Mention and tags',
    FOLLOWER = 'Followers'
}

export enum NotificationMess {
    LIKE = 'liked your video.',
    COMMENT = 'comment your video:',
    MENTIONS_AND_TAGS = 'Mention and tags',
    FOLLOWER = 'Followes you'
}
@Entity()
export class Notification extends BaseEntityUUID {

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user' })
    user: Customer;

    @ManyToOne(() => Customer,)
    @JoinColumn({ name: 'interacting_user' })
    interactingUser: Customer;

    @ManyToOne(() => Video, { nullable: true })
    @JoinColumn({ name: 'video' })
    video: Video;

    @Column({ type: 'text' })
    message: string;

    @Column()
    status: boolean;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;
}
