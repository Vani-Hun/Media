import { Career } from 'src/career/career.entity';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Applicant extends BaseEntity {
  @ManyToOne(() => Career, (career) => career.applicants)
  @JoinColumn()
  career: Career;

  @Column()
  name: string

  @Column({type:'varchar'})
  email: string

  @Column({type:'varchar'})
  phone: string

  @Column({type:'varchar'})
  position: string

  @Column({type:'varchar'})
  card: string

  @Column({type:'varchar'})
  birth: Date

  @Column({type:'datetime', default: ()=>'NOW()'})
  submitDate: string
}
