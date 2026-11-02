import { Injectable } from '@nestjs/common';
import { DictionariesResponse } from './dto/dictionaries-response.dto';

@Injectable()
export class DictionariesService {
  getDictionaries(): DictionariesResponse {
    return {
      categories: [
        { value: 'electronics', label: 'Электроника' },
        { value: 'clothes', label: 'Одежда' },
        { value: 'auto', label: 'Авто' },
        { value: 'home', label: 'Квартиры' },
        { value: 'sport', label: 'Спорт' },
      ],
      locations: [
        { value: 'minsk', label: 'Минск' },
        { value: 'mogilev', label: 'Могилёв' },
        { value: 'gomel', label: 'Гомель' },
        { value: 'vitebsk', label: 'Витебск' },
        { value: 'grodno', label: 'Гродно' },
        { value: 'brest', label: 'Брест' },
      ],
    };
  }
}
