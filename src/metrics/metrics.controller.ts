import { Controller, Get, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics() {
    // Temporairement désactivé pour Prometheus (demo soutenance)
    // const expectedApiKey = process.env.METRICS_API_KEY;
    // if (!expectedApiKey || apiKey !== expectedApiKey) {
    //   throw new UnauthorizedException('Invalid or missing API key');
    // }

    return this.metricsService.getPrometheusMetrics();
  }
}
