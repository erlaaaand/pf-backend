import { PaymentEntity } from '../../domains/entities/payment.entity';

export const PAYMENT_REPOSITORY_TOKEN = 'PAYMENT_REPOSITORY_TOKEN';

export interface IPaymentRepository {
  save(payment: PaymentEntity): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
}
