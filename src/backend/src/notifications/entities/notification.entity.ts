import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'notifications', schema: 'app' })
export class NotificationEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ length: 255 })
  username!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  link!: string | null;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
