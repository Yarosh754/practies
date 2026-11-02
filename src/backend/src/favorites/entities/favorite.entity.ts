import {
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'favorites', schema: 'app' })
export class FavoriteEntity {
  @PrimaryColumn({ name: 'username', length: 255 })
  username!: string;

  @PrimaryColumn({ name: 'ad_id', type: 'bigint' })
  adId!: string;
}
