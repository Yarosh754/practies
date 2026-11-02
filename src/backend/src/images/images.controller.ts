import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { ApiError } from '../common/dto/api-error.dto';
import { ImageUploadResponse } from './dto/image-upload-response.dto';
import { ImagesService } from './images.service';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  @Post()
  @UseGuards(KeycloakAuthGuard)
  @ApiSecurity('keycloak')
  @ApiOperation({ operationId: 'uploadImage', summary: 'Загрузить изображение' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiCreatedResponse({ type: ImageUploadResponse })
  @ApiBadRequestResponse({ type: ApiError })
  @ApiUnauthorizedResponse({ type: ApiError })
  upload(@UploadedFile() file?: Express.Multer.File): Promise<ImageUploadResponse> {
    return this.images.save(file);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getImage', summary: 'Получить изображение по ID' })
  @ApiParam({ name: 'id', description: 'Идентификатор изображения' })
  @ApiOkResponse({
    description: 'Файл изображения',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/webp': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiNotFoundResponse({ type: ApiError })
  async get(@Param('id') id: string, @Res() response: Response): Promise<void> {
    const image = await this.images.find(id);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Content-Length', image.data.length);
    response.send(image.data);
  }
}
