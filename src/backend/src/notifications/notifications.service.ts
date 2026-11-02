import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './dto/notification.dto';
import { NotificationEntity } from './entities/notification.entity';

function toNotification(entity: NotificationEntity): Notification {
  return {
    id: String(entity.id),
    message: entity.message,
    createdAt: new Date(entity.createdAt).toISOString(),
    read: entity.read,
    link: entity.link,
  };
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifications: Repository<NotificationEntity>,
  ) {}

  async create(
    username: string,
    message: string,
    link: string | null = null,
  ): Promise<void> {
    await this.notifications.save(
      this.notifications.create({ username, message, link }),
    );
  }

  async list(username: string): Promise<Notification[]> {
    const rows = await this.notifications.find({
      where: { username },
      order: { createdAt: 'DESC' },
    });
    return rows.map(toNotification);
  }

  async clear(username: string): Promise<void> {
    await this.notifications.delete({ username });
  }

  async markAllAsRead(username: string): Promise<void> {
    await this.notifications.update(
      { username, read: false },
      { read: true },
    );
  }
}
