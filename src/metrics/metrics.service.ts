import { Injectable } from '@nestjs/common';

interface RequestMetrics {
  totalRequests: number;
  requestsByMethod: Record<string, number>;
  errorsByStatus: Record<string, number>;
  responseTimes: number[];
}

@Injectable()
export class MetricsService {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    requestsByMethod: {},
    errorsByStatus: {},
    responseTimes: [],
  };
  private startTime: number = Date.now();

  incrementRequest(method: string): void {
    this.metrics.totalRequests++;
    this.metrics.requestsByMethod[method] =
      (this.metrics.requestsByMethod[method] || 0) + 1;
  }

  recordResponseTime(time: number): void {
    this.metrics.responseTimes.push(time);
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  recordError(statusCode: number): void {
    const status = statusCode.toString();
    this.metrics.errorsByStatus[status] =
      (this.metrics.errorsByStatus[status] || 0) + 1;
  }

  getMetrics() {
    const avgResponseTime =
      this.metrics.responseTimes.length > 0
        ? (
            this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
            this.metrics.responseTimes.length
          ).toFixed(2)
        : 0;

    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    return {
      uptime: uptimeFormatted,
      uptimeSeconds,
      totalRequests: this.metrics.totalRequests,
      requestsByMethod: this.metrics.requestsByMethod,
      errorsByStatus: this.metrics.errorsByStatus,
      averageResponseTime: `${avgResponseTime}ms`,
      timestamp: new Date().toISOString(),
    };
  }

  // Format Prometheus text/plain pour scraping
  getPrometheusMetrics(): string {
    const avgResponseTime =
      this.metrics.responseTimes.length > 0
        ? (
            this.metrics.responseTimes.reduce((a, b) => a + b, 0) /
            this.metrics.responseTimes.length
          ).toFixed(2)
        : '0';

    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    let output = '';

    // Total requests
    output += `# HELP http_requests_total Total number of HTTP requests\n`;
    output += `# TYPE http_requests_total counter\n`;
    output += `http_requests_total ${this.metrics.totalRequests}\n\n`;

    // Requests by method
    output += `# HELP http_requests_by_method HTTP requests by method\n`;
    output += `# TYPE http_requests_by_method counter\n`;
    for (const [method, count] of Object.entries(
      this.metrics.requestsByMethod,
    )) {
      output += `http_requests_by_method{method="${method}"} ${count}\n`;
    }
    output += `\n`;

    // Errors by status
    output += `# HELP http_errors_by_status HTTP errors by status code\n`;
    output += `# TYPE http_errors_by_status counter\n`;
    for (const [status, count] of Object.entries(this.metrics.errorsByStatus)) {
      output += `http_errors_by_status{status="${status}"} ${count}\n`;
    }
    output += `\n`;

    // Average response time
    output += `# HELP http_request_duration_seconds Average HTTP request duration\n`;
    output += `# TYPE http_request_duration_seconds gauge\n`;
    output += `http_request_duration_seconds ${(parseFloat(avgResponseTime) / 1000).toFixed(6)}\n\n`;

    // Uptime
    output += `# HELP process_uptime_seconds Process uptime in seconds\n`;
    output += `# TYPE process_uptime_seconds counter\n`;
    output += `process_uptime_seconds ${uptimeSeconds}\n\n`;

    // Up metric
    output += `# HELP up Service is up\n`;
    output += `# TYPE up gauge\n`;
    output += `up 1\n`;

    return output;
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: {},
      errorsByStatus: {},
      responseTimes: [],
    };
    this.startTime = Date.now();
  }
}
