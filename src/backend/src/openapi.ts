import { NestFactory } from '@nestjs/core';
import { dump } from 'js-yaml';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './app.module';
import {
  createOpenApiDocument,
  toOrderedDocument,
} from './openapi.document';

async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });

  const document = createOpenApiDocument(app);

  const outputPath = resolve(
    __dirname,
    '..',
    '..',
    '..',
    'docs',
    'openapi.yaml',
  );
  writeFileSync(
    outputPath,
    dump(toOrderedDocument(document), { noRefs: true, lineWidth: -1 }),
    'utf8',
  );
  await app.close();
}

void generate();
