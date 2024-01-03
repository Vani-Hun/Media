import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Video } from 'src/video/video.entity';

export enum NotificationType {
    LIKE = 'Like',
    COMMENT = 'Comment',
    MENTIONS_AND_TAGS = 'Mention and tags',
    FOLLOWER = 'Follower'
}

@Entity()
export class Notification extends BaseEntityUUID {
    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user' })
    user: Customer;

    @ManyToOne(() => Customer,)
    @JoinColumn({ name: 'interacting_user' })
    interactingUser: Customer;

    @ManyToOne(() => Video)
    @JoinColumn({ name: 'video' })
    video: Video;

    @Column({ type: 'text' })
    message: string;

    @Column()
    status: boolean;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;
}
