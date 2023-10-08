import { AboutUs } from 'src/aboutUs/aboutUs.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Project } from 'src/project/project.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => Project, (project) => project.product)
  projects: Project[];

  @ManyToOne(() => AboutUs, (aboutUs) => aboutUs.products)
  @JoinColumn()
  aboutUs: AboutUs;
}
