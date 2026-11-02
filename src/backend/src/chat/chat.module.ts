import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsModule } from '../ads/ads.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessageEntity } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessageEntity]),
    AdsModule,
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
