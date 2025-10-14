import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Security
  app.use(helmet.default());
  app.enableCors();

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('miniERP API')
    .setDescription('Modular ERP API with REST + OpenAPI')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Users', 'User management')
    .addTag('Clients', 'Client management')
    .addTag('Suppliers', 'Supplier management')
    .addTag('Products', 'Product catalog')
    .addTag('Pricing', 'Pricing & overrides')
    .addTag('Invoices', 'Invoice management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}
bootstrap();
