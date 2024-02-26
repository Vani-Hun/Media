import { Notification } from './../notification/notitfication.entity';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Message } from 'src/message/message.entity';

@Entity()
export class Conversation extends BaseEntityUUID {

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user' })
    user: Customer;

    @Column({ nullable: true })
    participant_id: string;

    @OneToMany(() => Message, conversation => conversation.conversation, { cascade: true })
    messages: Message[];
}
