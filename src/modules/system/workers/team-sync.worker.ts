import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SearchService } from '../search/search.service';

@Controller()
export class TeamSyncWorker {
  private readonly logger = new Logger(TeamSyncWorker.name);

  constructor(private readonly searchService: SearchService) {}

  @EventPattern('team.created')
  handleTeamCreated(@Payload() teamData: Record<string, unknown>) {
    this.logger.log(
      `Received team.created event for Team ID: ${teamData.id as string}`,
    );

    try {
      // Indexing data ke Elasticsearch
      this.searchService.indexDocument({
        index: 'teams',
        id: String(teamData.id),
        document: {
          name: teamData.name,
          institution: teamData.institution,
          leaderId: teamData.leaderId,
          status: teamData.status || 'PENDING',
        },
      });

      this.logger.log(
        `Successfully synced Team ID ${teamData.id as string} to Elasticsearch`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to sync team to ES: ${err.message}`, err.stack);
    }
  }
}
