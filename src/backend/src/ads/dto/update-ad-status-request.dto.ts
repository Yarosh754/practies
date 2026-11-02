import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AdStatus } from './ad-status.enum';

export class UpdateAdStatusRequest {
  @ApiProperty({ enum: AdStatus, enumName: 'AdStatus' })
  @IsEnum(AdStatus)
  status!: AdStatus;
}
