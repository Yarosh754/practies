import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddFavoriteRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  adId!: string;
}
