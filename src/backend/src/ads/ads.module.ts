import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { AdEntity } from './entities/ad.entity';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdEntity]),
    ImagesModule,
    NotificationsModule,
  ],
  controllers: [AdsController, ModerationController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}
