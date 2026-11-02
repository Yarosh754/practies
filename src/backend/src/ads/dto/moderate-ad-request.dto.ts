import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const MODERATION_DECISIONS = ['approve', 'reject'] as const;
export type ModerationDecision = (typeof MODERATION_DECISIONS)[number];

export class ModerateAdRequest {
  @ApiProperty({ enum: MODERATION_DECISIONS })
  @IsIn(MODERATION_DECISIONS)
  decision!: ModerationDecision;
}
