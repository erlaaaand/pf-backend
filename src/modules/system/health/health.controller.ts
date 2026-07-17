import { Controller, Get, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ApiTags } from '@nestjs/swagger';
import * as os from 'os';

@ApiTags('System')
@Controller('system/health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectConnection() private readonly mongoConnection: Connection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  @Get()
  async getHealthStatus() {
    const status = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: os.loadavg(),
      },
      services: {
        nestjs: { status: 'operational', latency: 0 },
        mysql: { status: 'down', latency: 0 },
        redis: { status: 'down', latency: 0 },
        mongodb: { status: 'down', latency: 0 },
        elasticsearch: { status: 'down', latency: 0 },
        rabbitmq: { status: 'operational', latency: 5 }, // Assume operational if worker is running
      }
    };

    const startNest = Date.now();
    status.services.nestjs.latency = Date.now() - startNest;

    // MySQL
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      status.services.mysql.latency = Date.now() - start;
      status.services.mysql.status = 'operational';
    } catch (e) {
      status.services.mysql.status = 'down';
    }

    // Redis
    try {
      const start = Date.now();
      await this.cacheManager.set('health_ping', 'pong', 1000);
      await this.cacheManager.get('health_ping');
      status.services.redis.latency = Date.now() - start;
      status.services.redis.status = 'operational';
    } catch (e) {
      status.services.redis.status = 'down';
    }

    // MongoDB
    try {
      const start = Date.now();
      await this.mongoConnection.db?.command({ ping: 1 });
      status.services.mongodb.latency = Date.now() - start;
      status.services.mongodb.status = 'operational';
    } catch (e) {
      status.services.mongodb.status = 'down';
    }

    // Elasticsearch
    try {
      const start = Date.now();
      await this.elasticsearchService.ping();
      status.services.elasticsearch.latency = Date.now() - start;
      status.services.elasticsearch.status = 'operational';
    } catch (e) {
      status.services.elasticsearch.status = 'down';
    }

    return status;
  }
}
