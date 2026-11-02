import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DictionariesService } from './dictionaries.service';
import { DictionariesResponse } from './dto/dictionaries-response.dto';

@ApiTags('Dictionaries')
@Controller('dictionaries')
export class DictionariesController {
  constructor(private readonly dictionaries: DictionariesService) {}

  @Get()
  @ApiOperation({
    operationId: 'getDictionaries',
    summary: 'Получить справочники (категории и города)',
    description: 'Используется для выпадающих списков на фронтенде.',
  })
  @ApiOkResponse({ type: DictionariesResponse })
  getDictionaries(): DictionariesResponse {
    return this.dictionaries.getDictionaries();
  }
}
