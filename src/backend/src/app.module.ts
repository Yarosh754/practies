import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsModule } from './ads/ads.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DictionariesModule } from './dictionaries/dictionaries.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ImagesModule } from './images/images.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '9300', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'arosv754',
      database: process.env.DB_NAME || 'practics',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    AdsModule,
    ChatModule,
    FavoritesModule,
    NotificationsModule,
    DictionariesModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
