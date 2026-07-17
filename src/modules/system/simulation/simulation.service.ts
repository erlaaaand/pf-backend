import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity, UserRole } from '../../identity/users/domains/entities/user.entity';
import { SandboxAuditLog } from './entities/sandbox-audit-log.schema';
import { InjectDataDto, RunSimulationDto } from './dto/run-simulation.dto';
import { v4 as uuidv4 } from 'uuid';
import { MESSAGE_BROKER } from '../queue/queue.module';

@Injectable()
export class SimulationService {
  private readonly logger = new Logger(SimulationService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectModel(SandboxAuditLog.name)
    private readonly auditModel: Model<SandboxAuditLog>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(MESSAGE_BROKER) private readonly rabbitClient: ClientProxy,
  ) {}

  async injectData(dto: InjectDataDto) {
    const results = {
      insertTimeMs: 0,
      mongoTimeMs: 0,
      totalTimeMs: 0,
      recordsProcessed: dto.dataCount,
      message: 'Data injection completed',
      logs: [] as string[],
    };

    const pushLog = (level: string, msg: string) => {
      const time = new Date().toISOString();
      results.logs.push(`[${time}] [${level}] ${msg}`);
      this.logger.log(`[${level}] ${msg}`);
    };

    const overallStart = Date.now();

    // Generate Dummy UserEntity Data
    const dummyData = Array.from({ length: dto.dataCount }).map((_, i) => ({
      id: uuidv4(),
      email: `sandbox_${uuidv4().substring(0,8)}@festival.com`,
      password: 'sandbox_password',
      fullName: `Sandbox Participant ${i}`,
      phoneNumber: `081${Math.floor(Math.random() * 100000000)}`,
      institution: 'SANDBOX_SIMULATION', // Marker for safe cleanup
      role: UserRole.PARTICIPANT,
      isActive: true,
      isEmailVerified: true,
    }));

    // 1. RABBITMQ vs SYNCHRONOUS INSERT
    const insertStart = Date.now();
    if (dto.useRabbitMQ) {
      for (const item of dummyData) {
        this.rabbitClient.emit('simulation.sandbox_insert', item);
      }
      results.insertTimeMs = Date.now() - insertStart;
      pushLog('RabbitMQ', `Pushed ${dto.dataCount} real entity msgs to queue in ${results.insertTimeMs}ms`);
    } else {
      await this.userRepo.save(dummyData, { chunk: 1000 });
      results.insertTimeMs = Date.now() - insertStart;
      pushLog('MySQL', `Synchronous bulk insert of ${dto.dataCount} UserEntity records took ${results.insertTimeMs}ms`);
    }

    // 2. MONGODB AUDIT LOGGING
    if (dto.useMongoDB) {
      const mongoStart = Date.now();
      const auditDocs = dummyData.map(item => ({
        action: 'SANDBOX_USER_CREATED',
        details: { id: item.id, email: item.email, trigger: 'Simulation Load Test' }
      }));
      await this.auditModel.insertMany(auditDocs);
      results.mongoTimeMs = Date.now() - mongoStart;
      pushLog('MongoDB', `Logged ${dto.dataCount} real user audit trails to NoSQL in ${results.mongoTimeMs}ms`);
    }

    // Index into ElasticSearch asynchronously in background
    setTimeout(async () => {
      const body = dummyData.flatMap(doc => [{ index: { _index: 'sandbox_users', _id: doc.id } }, doc]);
      if (body.length > 0) {
        try {
          await this.elasticsearchService.bulk({ refresh: true, operations: body });
        } catch (e) {
          // ignore
        }
      }
    }, 100);

    results.totalTimeMs = Date.now() - overallStart;
    return results;
  }

  async runSimulation(dto: RunSimulationDto) {
    const results = {
      searchTimeMs: 0,
      fetchTimeMs: 0,
      totalTimeMs: 0,
      cacheHit: false,
      message: 'Simulation completed',
      logs: [] as string[],
    };

    const pushLog = (level: string, msg: string) => {
      const time = new Date().toISOString();
      results.logs.push(`[${time}] [${level}] ${msg}`);
      this.logger.log(`[${level}] ${msg}`);
    };

    const overallStart = Date.now();
    const count = await this.userRepo.count({ where: { institution: 'SANDBOX_SIMULATION' } });
    
    // 1. REDIS vs MYSQL FETCH
    const fetchStart = Date.now();
    const cacheKey = `sandbox_users_fetch_${count > 0 ? count : 'empty'}`;
    if (dto.useRedis) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        results.cacheHit = true;
        results.fetchTimeMs = Date.now() - fetchStart;
        pushLog('Redis', `Fetched real UserEntity from cache (HIT) in ${results.fetchTimeMs}ms`);
      } else {
        const data = await this.userRepo.find({ where: { institution: 'SANDBOX_SIMULATION' }, take: 1000 });
        await this.cacheManager.set(cacheKey, data, 60000);
        results.fetchTimeMs = Date.now() - fetchStart;
        pushLog('Redis', `Fetched UserEntity from DB and cached (MISS) in ${results.fetchTimeMs}ms`);
      }
    } else {
      await this.userRepo.find({ where: { institution: 'SANDBOX_SIMULATION' }, take: 1000 });
      results.fetchTimeMs = Date.now() - fetchStart;
      pushLog('MySQL', `Fetched UserEntity directly from DB (No Cache) in ${results.fetchTimeMs}ms`);
    }

    // 2. ELASTICSEARCH vs MYSQL LIKE
    const searchStart = Date.now();
    const searchTerm = "Sandbox Participant";
    if (dto.useElasticSearch) {
      try {
        await this.elasticsearchService.search({
          index: 'sandbox_users',
          query: { match: { fullName: searchTerm } }
        });
        results.searchTimeMs = Date.now() - searchStart;
        pushLog('ElasticSearch', `Fuzzy search on UserEntity completed in ${results.searchTimeMs}ms`);
      } catch (err) {
        pushLog('ElasticSearch', `Search failed (index might not exist). Skipping.`);
      }
    } else {
      await this.userRepo
        .createQueryBuilder('user')
        .where('user.fullName LIKE :term', { term: `%${searchTerm}%` })
        .andWhere('user.institution = :inst', { inst: 'SANDBOX_SIMULATION' })
        .limit(100)
        .getMany();
      results.searchTimeMs = Date.now() - searchStart;
      pushLog('MySQL', `LIKE %..% search on UserEntity completed in ${results.searchTimeMs}ms`);
    }

    results.totalTimeMs = Date.now() - overallStart;
    return results;
  }

  async cleanup() {
    // Safely delete only Sandbox users
    await this.userRepo.delete({ institution: 'SANDBOX_SIMULATION' });
    
    // Clear Redis Cache for sandbox
    const knownKeys = ['sandbox_users_fetch_10', 'sandbox_users_fetch_100', 'sandbox_users_fetch_1000', 'sandbox_users_fetch_10000', 'sandbox_users_fetch_empty'];
    for (const key of knownKeys) {
      await this.cacheManager.del(key);
    }

    // Delete MongoDB records
    await this.auditModel.deleteMany({});

    // Delete index from ES if exists
    try {
      await this.elasticsearchService.indices.delete({ index: 'sandbox_users' });
    } catch (e) {
      // ignore
    }

    return { message: 'Real Entity Sandbox environment cleaned up safely' };
  }
}
