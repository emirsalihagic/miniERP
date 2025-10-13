import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS for production
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // API prefix
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix);

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Mini ERP API')
      .setDescription('Mini ERP Backend API Documentation')
      .setVersion(process.env.API_VERSION || '1.0.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
          // Add any custom request handling here
          return req;
        },
      },
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 20px 0 }
      `,
      customSiteTitle: 'Mini ERP API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
        'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js',
      ],
      customCssUrl: [
        'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
      ],
    });

    await app.init();
  }
  
  return app;
}

// For Vercel
export default async (req: any, res: any) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  });
}
