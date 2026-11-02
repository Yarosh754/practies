import { ApiProperty } from '@nestjs/swagger';
import { Option } from './option.dto';

export class DictionariesResponse {
  @ApiProperty({ type: () => [Option] })
  categories!: Option[];

  @ApiProperty({ type: () => [Option] })
  locations!: Option[];
}
