import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Mailbox extends BaseEntity {
    @Column({type:'varchar'})
    hrMailbox: string

    @Column({type:'text'})
    titleToHR: string

    @Column({type:'text'})
    contentToHR: string

    @Column({type:'varchar'})
    autoMail: string

    @Column({type:'varchar'})
    pw_autoMail: string

    @Column({type:'varchar'})
    service_autoMail: string

    @Column({type:'text'})
    titleToCandidate: string

    @Column({type:'text'})
    contentToCandidate: string
}
