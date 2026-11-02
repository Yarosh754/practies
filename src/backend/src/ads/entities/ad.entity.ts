import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdStatus } from '../dto/ad-status.enum';

@Entity({ name: 'ads', schema: 'app' })
export class AdEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ length: 30 })
  title!: string;

  @Column({ length: 1000 })
  description!: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  price!: number;

  @Column({ name: 'category_id', length: 64 })
  categoryId!: string;

  @Column({ length: 64 })
  location!: string;

  @Column({ type: 'varchar', length: 16, default: AdStatus.MODERATION })
  status!: AdStatus;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  images!: string[];

  @Column({ name: 'author_id', length: 255 })
  authorId!: string;

  @Column({ length: 32 })
  phone!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
