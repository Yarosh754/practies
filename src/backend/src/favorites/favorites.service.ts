import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdEntity } from '../ads/entities/ad.entity';
import { FavoriteEntity } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favorites: Repository<FavoriteEntity>,
    @InjectRepository(AdEntity)
    private readonly ads: Repository<AdEntity>,
  ) {}

  async list(username: string): Promise<string[]> {
    const rows = await this.favorites.find({
      where: { username },
      select: { adId: true },
    });
    return rows.map((row) => String(row.adId));
  }

  async add(username: string, adId: string): Promise<void> {
    if (!/^\d+$/.test(adId)) {
      throw new NotFoundException('Ad not found');
    }

    const ad = await this.ads.findOne({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    await this.favorites
      .createQueryBuilder()
      .insert()
      .into(FavoriteEntity)
      .values({ username, adId })
      .orIgnore()
      .execute();
  }

  async remove(username: string, adId: string): Promise<void> {
    if (!/^\d+$/.test(adId)) {
      return;
    }
    await this.favorites.delete({ username, adId });
  }
}
