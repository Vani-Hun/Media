import { BaseEntity } from 'src/common/entities/base.entity';
import { Personnel } from 'src/personnel/personnel.entity';
import { Department } from 'src/department/department.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Product } from 'src/product/product.entity';
import { Contact } from 'src/contact/contact.entity';

@Entity()
export class AboutUs extends BaseEntity {
  @Column({ type: 'text' })
  introduction: string;

  @Column({ type: 'text' })
  goals: string;

  @Column({ type: 'text' })
  values: string;

  @OneToMany(() => Personnel, (personnel) => personnel.aboutUs)
  personnels: Personnel[];

  @OneToMany(() => Department, (department) => department.aboutUs)
  departments: Department[];

  @OneToMany(() => Product, (product) => product)
  products: Product[];

  @OneToOne(() => Contact, (contact) => contact.aboutUs)
  @JoinColumn()
  contact: Contact;
}
