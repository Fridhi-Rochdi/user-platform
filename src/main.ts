import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import { TracingInterceptor } from './common/interceptors/tracing.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new GlobalExceptionFilter(),
  );
  app.useGlobalInterceptors(new TracingInterceptor(), new LoggingInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  winstonConfig.log(`Application is running on: http://localhost:${port}`);
  winstonConfig.log('Database connection established successfully');
}
bootstrap();
