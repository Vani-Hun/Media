import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;


  updateAt: Date;

  @CreateDateColumn()
  createAt: Date;
}

export class BaseEntityUUID {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  updateAt: Date;

  @CreateDateColumn()
  createAt: Date;
}
