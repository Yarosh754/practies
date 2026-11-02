import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { ImageUploadResponse } from './dto/image-upload-response.dto';
import { ImageEntity } from './entities/image.entity';

const ALLOWED_MIME_TYPES: Record<string, true> = {
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
};

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly images: Repository<ImageEntity>,
  ) {}

  async save(file?: Express.Multer.File): Promise<ImageUploadResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!ALLOWED_MIME_TYPES[file.mimetype]) {
      throw new BadRequestException('Unsupported image type');
    }

    const image = this.images.create({
      id: randomUUID(),
      mimeType: file.mimetype,
      data: file.buffer,
    });
    await this.images.save(image);
    return { id: image.id };
  }

  async find(id: string): Promise<ImageEntity> {
    if (!isUUID(id)) {
      throw new NotFoundException('Image not found');
    }

    const image = await this.images.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  async assertExist(ids: string[]): Promise<void> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0) {
      return;
    }

    const existing = await this.images.find({
      where: { id: In(uniqueIds) },
      select: { id: true },
    });
    if (existing.length === uniqueIds.length) {
      return;
    }

    const existingIds = new Set(existing.map((image) => image.id));
    const missing = uniqueIds.find((id) => !existingIds.has(id));
    throw new BadRequestException(`Unknown image id: ${missing}`);
  }
}
