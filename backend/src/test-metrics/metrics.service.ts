import { Injectable, Inject } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('login_attempts_total')
    private readonly loginAttemptsCounter: Counter,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpDurationHistogram: Histogram,
    @InjectMetric('process_memory_bytes')
    private readonly memoryGauge: Gauge,
    @InjectMetric('app_uptime_seconds')
    private readonly uptimeGauge: Gauge,
  ) {}

  incrementLoginAttempts(role: string, status: 'success' | 'failed') {
    this.loginAttemptsCounter.inc({ role, status });
  }

  recordHttpDuration(method: string, path: string, duration: number) {
    this.httpDurationHistogram.observe({ method, path }, duration);
  }

  updateMemoryUsage(bytes: number) {
    this.memoryGauge.set(bytes);
  }

  updateUptime(seconds: number) {
    this.uptimeGauge.set(seconds);
  }
}
