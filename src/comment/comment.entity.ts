import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Video } from 'src/video/video.entity';
import { Customer } from 'src/customer/customer.entity';

@Entity()
export class Comment extends BaseEntityUUID {
    @Column()
    text: string;

    @ManyToOne(() => Video)
    @JoinColumn({ name: 'video' })
    video: Video;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer' })
    customer: Customer;
}