import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../domains/entities/payment.entity';
import type { IPaymentRepository } from './payment.repository.interface';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
  ) {}

  async save(payment: PaymentEntity): Promise<PaymentEntity> {
    return this.repo.save(payment);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    return this.repo.findOne({
      where: { id },
      relations: {
        registration: true,
      },
    });
  }
}
