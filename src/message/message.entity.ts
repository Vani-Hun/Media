import { Notification } from './../notification/notitfication.entity';
import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Comment } from 'src/comment/comment.entity';
import { Customer } from 'src/customer/customer.entity';
import { Conversation } from 'src/conversation/conversation.entity';


@Entity()
export class Message extends BaseEntityUUID {

    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'conversation_id' })
    conversation_id: Conversation;

    @Column({ nullable: false })
    user_id: string;

    @Column({ nullable: true })
    text: string;

}
