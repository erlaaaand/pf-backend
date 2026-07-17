import { IsNumber, IsBoolean, IsIn } from 'class-validator';

export class InjectDataDto {
  @IsNumber()
  @IsIn([10, 100, 1000, 10000])
  dataCount: number = 10;

  @IsBoolean()
  useRabbitMQ: boolean = true;

  @IsBoolean()
  useMongoDB: boolean = true;
}

export class RunSimulationDto {
  @IsBoolean()
  useRedis: boolean = true;

  @IsBoolean()
  useElasticSearch: boolean = true;
}
