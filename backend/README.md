<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Monitoring with Prometheus and Grafana

This project includes Prometheus for metrics collection and Grafana for visualization.

### Starting the Services

```bash
# Start all monitoring services (Prometheus, Grafana, Kafka, Zookeeper)
docker compose up -d

# Or start just the monitoring services
docker compose up -d prometheus grafana
```

### Accessing the Services

- **Prometheus**: http://localhost:9090
  - View metrics, query with PromQL
  - Access backend metrics at: http://localhost:9090/graph?g0.expr=http_request_duration_seconds

- **Grafana**: http://localhost:3002
  - Login: `admin` / `admin`
  - Add Prometheus as a data source:
    - Go to Configuration > Data Sources > Add data source
    - Select Prometheus
    - URL: `http://localhost:9090`
    - Click "Save & Test"

### Backend Metrics Endpoint

The backend exposes metrics at `http://localhost:4000/metrics` (Prometheus format).

Available metrics include:

- `login_attempts_total` - Counter for login attempts (labels: role, status)
- `http_request_duration_seconds` - Histogram for HTTP request duration
- `process_memory_bytes` - Gauge for memory usage
- `app_uptime_seconds` - Gauge for application uptime

### Creating Dashboards in Grafana

1. Log in to Grafana at http://localhost:3002
2. Go to Dashboards > New > New Dashboard
3. Click "Add Visualization" and select Prometheus
4. Example queries:
   - **HTTP Requests/sec**: `rate(http_request_duration_seconds_count[5m])`
   - **Avg Response Time**: `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])`
   - **Login Success Rate**: `sum(rate(login_attempts_total{status="success"}[5m])) / sum(rate(login_attempts_total[5m]))`
   - **Memory Usage**: `process_memory_bytes`

### Kubernetes Deployment

The project includes Kubernetes manifests in `.k8s/` directory.

#### Deploy All Services

```bash
# MongoDB
kubectl apply -f .k8s/mongodb-deployment.yaml
kubectl apply -f .k8s/mongodb-service.yaml

# Redis
kubectl apply -f .k8s/redis-deployment.yaml
kubectl apply -f .k8s/redis-service.yaml

# Backend
kubectl apply -f .k8s/backend-deployment.yaml
kubectl apply -f .k8s/backend-service.yaml

# Frontend (from frontend/.k8s/)
kubectl apply -f ../frontend/.k8s/frontend-deployment.yaml
kubectl apply -f ../frontend/.k8s/frontend-service.yaml

# Verify all pods are running
kubectl get pods
```

#### Accessing Services

```bash
# Frontend
kubectl port-forward svc/frontend 3000:3000
# Access at: http://localhost:3000

# Backend
kubectl port-forward svc/backend 4000:4000
# Access at: http://localhost:4000

# MongoDB (for debugging)
kubectl port-forward svc/mongodb 27017:27017

# Redis (for debugging)
kubectl port-forward svc/redis 6379:6379
```

#### Update Backend Environment

The backend deployment needs MongoDB connection. Update the deployment:

```bash
kubectl set env deployment/backend MONGODB_URI=mongodb://mongodb:27017/brandinfluencer
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
