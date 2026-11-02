import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdEntity } from '../ads/entities/ad.entity';
import { FavoriteEntity } from './entities/favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteEntity, AdEntity])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
