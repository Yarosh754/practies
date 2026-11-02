import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { dump } from 'js-yaml';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';

const REALM = process.env.KEYCLOAK_REALM ?? 'practics';
const KEYCLOAK_URL = process.env.KEYCLOAK_EXTERNAL_URL ?? 'http://localhost:9200';

const DESCRIPTION = `Просмотр активных объявлений (\`ACTIVE\`) любой, без токена
Создание, редактирование, удаление объявления любой авторизованный пользователь
Смена статуса (\`SOLD\`, \`DELETE\`) только автор объявления
Модерация (\`ACTIVE\`, \`REJECTED\`) только администратор
Просмотр и отправка сообщений в чат участники чата (автор объявления и покупатель)
Добавление в избранное, просмотр уведомлений любой авторизованный пользователь

- \`MODERATION\` — на модерации (видно только автору и админу).
- \`ACTIVE\` — активно (видно всем).
- \`SOLD\` — продано.
- \`DELETE\` — мягкое удаление.
- \`REJECTED\` — отклонено модератором.
Все ошибки возвращаются в виде \`ApiError\`.`;

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Kufar Clone')
    .setVersion('1.0.0')
    .setDescription(DESCRIPTION)
    .addServer('http://localhost:9100', 'Backend в Docker Compose')
    .addTag('Ads', 'Управление объявлениями')
    .addTag('Moderation', 'Модерация объявлений (только admin)')
    .addTag('Chat', 'Сообщения и чаты')
    .addTag('Favorites', 'Избранные объявления')
    .addTag('Notifications', 'Уведомления пользователя')
    .addTag('Dictionaries', 'Справочники (категории и города)')
    .addTag('Images', 'Работа с изображениями (отдача файлов)')
    .addOAuth2(
      {
        type: 'oauth2',
        description: 'Авторизация через Keycloak',
        flows: {
          authorizationCode: {
            authorizationUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
            tokenUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
            scopes: { openid: 'Базовый scope OpenID Connect' },
          },
        },
      },
      'keycloak',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config) as OpenAPIObject;

  const optionalAuth: Array<Record<string, string[]>> = [
    {},
    { keycloak: [] },
  ];
  const adsPath = document.paths['/ads'];
  if (adsPath?.get) {
    adsPath.get.security = optionalAuth;
  }
  const adPath = document.paths['/ads/{id}'];
  if (adPath?.get) {
    adPath.get.security = optionalAuth;
  }

  const outputPath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    'docs',
    'openapi.yaml',
  );
  const ordered = {
    openapi: document.openapi,
    info: document.info,
    tags: document.tags,
    servers: document.servers,
    paths: document.paths,
    components: document.components,
  };
  writeFileSync(
    outputPath,
    dump(ordered, { noRefs: true, lineWidth: -1 }),
    'utf8',
  );
  await app.close();
}

void generate();
