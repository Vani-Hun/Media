import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;


  updateAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

export class BaseEntityUUID {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  // @Column({ type: 'timestamp', name: 'updateAt' })
  // updateAt: Date;
};
