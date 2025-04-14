import { register, Counter } from 'prom-client';

const testCasesTotal = new Counter({
  name: 'test_cases_total',
  help: 'Total test cases executed',
});

const testCasesFailed = new Counter({
  name: 'test_cases_failed',
  help: 'Total failed test cases',
});

register.registerMetric(testCasesTotal);
register.registerMetric(testCasesFailed);
