import { CompetitionRegistrationEntity } from '../../domains/entities/registration.entity';

export const REGISTRATION_REPOSITORY_TOKEN = 'REGISTRATION_REPOSITORY_TOKEN';

export interface IRegistrationRepository {
  save(
    registration: CompetitionRegistrationEntity,
  ): Promise<CompetitionRegistrationEntity>;
  findById(id: string): Promise<CompetitionRegistrationEntity | null>;

  // Mencari pendaftaran milik user tertentu (baik individu maupun perwakilan tim)
  findMyRegistrations(userId: string): Promise<CompetitionRegistrationEntity[]>;
}
