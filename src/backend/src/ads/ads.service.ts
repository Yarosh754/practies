import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import { ImagesService } from '../images/images.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Ad } from './dto/ad.dto';
import { AdStatus } from './dto/ad-status.enum';
import { CreateAdRequest } from './dto/create-ad-request.dto';
import { ListAdsQuery } from './dto/list-ads-query.dto';
import { ModerationDecision } from './dto/moderate-ad-request.dto';
import { AdEntity } from './entities/ad.entity';

export function toAd(entity: AdEntity): Ad {
  return {
    id: String(entity.id),
    title: entity.title,
    description: entity.description,
    price: Number(entity.price),
    categoryId: entity.categoryId,
    status: entity.status,
    location: entity.location,
    authorId: entity.authorId,
    phone: entity.phone,
    createdAt: new Date(entity.createdAt).toISOString(),
    images: entity.images ?? [],
  };
}

function canManage(ad: AdEntity, user?: AuthUser): boolean {
  return Boolean(
    user && (user.username === ad.authorId || user.roles.includes('admin')),
  );
}

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdEntity)
    private readonly ads: Repository<AdEntity>,
    private readonly images: ImagesService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(query: ListAdsQuery, user?: AuthUser): Promise<Ad[]> {
    const builder = this.ads.createQueryBuilder('ad');

    if (query.categoryId) {
      builder.andWhere('ad.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.location) {
      builder.andWhere('ad.location = :location', { location: query.location });
    }
    if (query.authorId) {
      builder.andWhere('ad.author_id = :authorId', {
        authorId: query.authorId,
      });
    }

    const isPrivilegedAuthor = Boolean(
      query.authorId &&
        user &&
        (user.username === query.authorId || user.roles.includes('admin')),
    );

    if (query.status) {
      if (!user?.roles.includes('admin')) {
        throw new ForbiddenException('Only admin can filter by status');
      }
      builder.andWhere('ad.status = :status', { status: query.status });
    } else if (!isPrivilegedAuthor) {
      builder.andWhere('ad.status = :status', { status: AdStatus.ACTIVE });
    }

    switch (query.sort ?? 'date-desc') {
      case 'date-asc':
        builder.orderBy('ad.created_at', 'ASC');
        break;
      case 'price-asc':
        builder.orderBy('ad.price', 'ASC');
        break;
      case 'price-desc':
        builder.orderBy('ad.price', 'DESC');
        break;
      default:
        builder.orderBy('ad.created_at', 'DESC');
        break;
    }

    const rows = await builder.getMany();
    return rows.map(toAd);
  }

  async findEntity(id: string): Promise<AdEntity | null> {
    if (!/^\d+$/.test(id)) {
      return null;
    }
    return this.ads.findOne({ where: { id } });
  }

  async getEntityOrFail(id: string): Promise<AdEntity> {
    const ad = await this.findEntity(id);
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }
    return ad;
  }

  async get(id: string, user?: AuthUser): Promise<Ad> {
    const ad = await this.getEntityOrFail(id);
    const isPublic = ad.status === AdStatus.ACTIVE || ad.status === AdStatus.SOLD;
    if (!isPublic && !canManage(ad, user)) {
      throw new NotFoundException('Ad not found');
    }
    return toAd(ad);
  }

  async create(dto: CreateAdRequest, user: AuthUser): Promise<Ad> {
    await this.images.assertExist(dto.images);

    const ad = this.ads.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      price: dto.price,
      categoryId: dto.categoryId,
      location: dto.location,
      phone: dto.phone.trim(),
      images: dto.images,
      authorId: user.username,
      status: AdStatus.MODERATION,
    });

    await this.ads.save(ad);
    return toAd(ad);
  }

  async update(id: string, dto: CreateAdRequest, user: AuthUser): Promise<Ad> {
    const ad = await this.getEntityOrFail(id);
    if (ad.authorId !== user.username) {
      throw new ForbiddenException('Only the author can update this ad');
    }
    await this.images.assertExist(dto.images);

    ad.title = dto.title.trim();
    ad.description = dto.description.trim();
    ad.price = dto.price;
    ad.categoryId = dto.categoryId;
    ad.location = dto.location;
    ad.phone = dto.phone.trim();
    ad.images = dto.images;
    ad.status = AdStatus.MODERATION;

    await this.ads.save(ad);
    return toAd(ad);
  }

  async updateStatus(
    id: string,
    status: AdStatus,
    user: AuthUser,
  ): Promise<Ad> {
    const ad = await this.getEntityOrFail(id);
    const isAdmin = user.roles.includes('admin');
    const isAuthor = user.username === ad.authorId;

    if (!isAdmin && !isAuthor) {
      throw new ForbiddenException('Only the author or admin can change status');
    }
    if (!isAdmin && status !== AdStatus.SOLD && status !== AdStatus.DELETE) {
      throw new ForbiddenException('Author can only set SOLD or DELETE');
    }

    ad.status = status;
    await this.ads.save(ad);
    return toAd(ad);
  }

  async moderate(
    id: string,
    decision: ModerationDecision,
  ): Promise<Ad> {
    const ad = await this.getEntityOrFail(id);
    ad.status = decision === 'approve' ? AdStatus.ACTIVE : AdStatus.REJECTED;
    await this.ads.save(ad);

    const message =
      decision === 'approve'
        ? `Объявление "${ad.title}" прошло модерацию и опубликовано`
        : `Объявление "${ad.title}" не прошло модерацию и было отклонено`;
    await this.notifications.create(ad.authorId, message, `/adMain/${ad.id}`);

    return toAd(ad);
  }
}
