import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';
import { register } from 'prom-client';

register.clear();

@Module({
  imports: [PrometheusModule.register({ path: '/metrics' })],
  providers: [
    makeCounterProvider({
      name: 'test_cases_total',
      help: 'Total test cases executed',
    }),
    makeCounterProvider({
      name: 'test_cases_failed',
      help: 'Total failed test cases',
    }),
    makeCounterProvider({
      name: 'test_cases_skipped',
      help: 'Total skipped test cases',
    }),
    makeHistogramProvider({
      name: 'test_execution_duration_seconds',
      help: 'Test execution time',
      buckets: [0.1, 1, 2, 5, 10],
    }),

    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'API response time',
      buckets: [0.1, 0.5, 1, 2],
    }),
    makeHistogramProvider({
      name: 'db_query_duration_seconds',
      help: 'Database query execution time',
      buckets: [0.01, 0.1, 1],
    }),
    makeGaugeProvider({ name: 'process_memory_bytes', help: 'Memory usage' }),
    makeGaugeProvider({ name: 'process_cpu_seconds_total', help: 'CPU usage' }),

    makeCounterProvider({
      name: 'app_exceptions_total',
      help: 'Total unhandled exceptions',
    }),
    makeCounterProvider({
      name: 'http_requests_failed_total',
      help: 'Total failed API requests',
    }),
    makeGaugeProvider({
      name: 'app_uptime_seconds',
      help: 'Application uptime',
    }),

    // Resource Utilization Metrics
    makeGaugeProvider({
      name: 'db_active_connections',
      help: 'Active database connections',
    }),
    makeGaugeProvider({
      name: 'process_open_fds',
      help: 'Open file descriptors',
    }),
    makeGaugeProvider({
      name: 'event_loop_lag_seconds',
      help: 'Event loop lag',
    }),

    makeCounterProvider({
      name: 'user_signups_total',
      help: 'Total user signups per test run',
    }),
    makeCounterProvider({
      name: 'transactions_processed_total',
      help: 'Total transactions processed',
    }),
  ],
})
export class MetricsModule {}
