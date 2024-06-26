import { Notification } from './../notification/notitfication.entity';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Hashtag } from 'src/hashtag/hashtag.entity';

@Entity()
export class Video extends BaseEntityUUID {

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user' })
    user: Customer;

    @Column()
    name: string;

    @Column()
    video: string;

    @Column({ default: 0 }) // Số lượt like, mặc định là 0
    views: number;

    @Column({ default: 0 }) // Số lượt like, mặc định là 0
    likes: number;

    @Column({ default: 0 }) // Số lượt comment, mặc định là 0
    share_count: number;

    @Column()
    caption: string;

    @Column()
    who: string;

    @Column()
    thumbnail: string;

    @Column()
    allow_comment: boolean;

    @ManyToMany(() => Customer, customer => customer.liked_videos)
    @JoinTable({
        name: 'video_like',
        joinColumn: { name: 'video_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'customer_id', referencedColumnName: 'id' },
    })
    likers: Customer[];

    @OneToMany(() => Comment, comment => comment.video, { cascade: true })
    comments: Comment[];

    @OneToMany(() => Notification, notification => notification.video, { cascade: true })
    notification: Notification[];

    @ManyToMany(() => Hashtag, hashtag => hashtag.videos)
    @JoinTable({
        name: 'video_hashtag',
        joinColumn: { name: 'video_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'hashtag_id', referencedColumnName: 'id' },
    })
    hashtags: Hashtag[];
}
