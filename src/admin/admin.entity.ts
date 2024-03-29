import { BaseEntityUUID } from 'src/common/entities/base.entity';
import { Conversation } from 'src/conversation/conversation.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Admin extends BaseEntityUUID {
  @Column()
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  password: string;

  @Column()
  permission: string;

  @OneToMany(() => Conversation, conversation => conversation.admin_id, { cascade: true })
  conversations: Conversation[];
}
