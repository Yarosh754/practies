import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (
      process.env.CORS_ORIGINS ??
      'http://localhost:9000,http://localhost:5173'
    ).split(','),
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
void bootstrap();
