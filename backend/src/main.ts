import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('1 - Iniciando Nest');

  const app = await NestFactory.create(AppModule);
  console.log('2 - App criada');

  const configService = app.get(ConfigService);
  console.log('3 - Config carregada');

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') ?? 3333;
  console.log('4 - Porta:', port);

  await app.listen(port, '0.0.0.0');

  console.log(`5 - Backend iniciado na porta ${port}`);
}

bootstrap();