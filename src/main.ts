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

  const port = Number(process.env.PORT) || 3002
  const host = process.env.HOST || 'localhost'

  const config = new DocumentBuilder()
    .setTitle('Sanibara v2 api')
    .setDescription('La documentation officielle de la plateforme de gestion de production SANIBARA')
    .setVersion('1.0')
    .setContact('Codesign', 'https://codesign.tech', 'contact@codesign.tech')
    .addServer(`http://${host}:${port}/api/v2`, 'Version 2 - dev')
    .addServer('https://sanibara-api.codesign.tech', 'Version 2 -production')

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
    defaultVersion: '2'
  });

  app.enableCors({
    origin: "*"
  })

  await app.listen(port);
}
bootstrap();
