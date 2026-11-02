import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'chat_messages', schema: 'app' })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ name: 'chat_id', length: 512 })
  chatId!: string;

  @Column({ name: 'sender_id', length: 255 })
  senderId!: string;

  @Column({ length: 2000 })
  text!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead!: boolean;
}
