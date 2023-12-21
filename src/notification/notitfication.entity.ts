import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
@Entity()
export class Video extends BaseEntityUUID {
    @ManyToOne(() => Customer, { cascade: true })
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
    shareCount: number;

    @Column()
    caption: string;

    @Column()
    who: string;

    @Column()
    thumbnail: string;

    @Column()
    allowComment: boolean;

    @ManyToMany(() => Customer, customer => customer.likedVideos, { cascade: true, })
    @JoinTable()
    likers: Customer[];

    @OneToMany(() => Comment, comment => comment.video, { cascade: true })
    comments: Comment[];
}
