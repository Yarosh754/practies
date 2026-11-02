import { ApiProperty } from '@nestjs/swagger';

export class ImageUploadResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
