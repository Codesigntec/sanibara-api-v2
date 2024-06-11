import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet())
  app.use(compression())

  const config = new DocumentBuilder()
    .setTitle('Sanibara v2 api')
    .setDescription('La documentation officielle de la plateforme de gestion de production SANIBARA')
    .setVersion('1.0')
    .setContact('Codesign', 'https://codesign.tech', 'contact@codesign.tech')
    .addServer('http://localhost:3002/api/v1', 'Version 1 - dev')
    .addServer('http://test.com', 'production')

    // .addTag('categories', 'Gestion des categories de produit')
    // .addTag('users', 'Gestions des utilisateurs')
    // .addTag('unities', 'Gestions des unites de produit')
    // .addTag('auth', 'Authentifications')

    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v', // default value = v
    defaultVersion: '1'
  });

  app.enableCors({
    origin: "*"
  })

  await app.listen(3002);
}
bootstrap();
