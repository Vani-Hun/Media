import { Notification } from './../notification/notitfication.entity';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Message } from 'src/message/message.entity';
import { Admin } from 'src/admin/admin.entity';

@Entity()
export class Conversation extends BaseEntityUUID {

    @ManyToOne(() => Admin)
    @JoinColumn({ name: 'admin_id' })
    admin_id: Admin;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'user_id' })
    user_id: Customer;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'participant_id' })
    participant_id: Customer;

    @OneToMany(() => Message, conversation => conversation.conversation_id, { cascade: true })
    messages: Message[];

    @Column({ default: 0 })
    count: number;
};
