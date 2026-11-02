import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'images', schema: 'app' })
export class ImageEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'mime_type', length: 64 })
  mimeType!: string;

  @Column({ type: 'bytea' })
  data!: Buffer;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
