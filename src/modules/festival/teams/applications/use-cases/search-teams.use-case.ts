import { Injectable } from '@nestjs/common';
import { SearchService } from '../../../../system/search/search.service';
import { TeamResponseDto } from '../dto/team-response.dto';

@Injectable()
export class SearchTeamsUseCase {
  constructor(private readonly searchService: SearchService) {}

  async execute(query: string): Promise<TeamResponseDto[]> {
    if (!query || query.trim().length < 3) {
      return [];
    }

    // Melakukan pencarian fuzzy di Elasticsearch pada index 'teams'
    // Mencari kecocokan pada nama tim dan institusi
    const results = await this.searchService.searchFuzzy<TeamResponseDto>(
      'teams',
      query,
      ['name', 'institution'],
    );

    return results;
  }
}
