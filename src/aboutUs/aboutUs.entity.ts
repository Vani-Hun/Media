import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Contact } from 'src/contact/contact.entity';

@Entity()
export class AboutUs extends BaseEntity {
  @Column({ type: 'text' })
  introduction: string;

  @Column({ type: 'text' })
  goals: string;

  @Column({ type: 'text' })
  values: string;

  @OneToOne(() => Contact, (contact) => contact.aboutUs)
  @JoinColumn()
  contact: Contact;
}
