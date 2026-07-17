import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface IndexDocumentDto {
  index: string;
  id: string;
  document: Record<string, unknown>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  /**
   * Indexes a document into Elasticsearch asynchronously.
   * Fire-and-forget logic to prevent blocking main thread operations.
   */
  public indexDocument(dto: IndexDocumentDto): void {
    this.elasticsearchService
      .index({
        index: dto.index,
        id: dto.id,
        document: dto.document,
      })
      .catch((err: Error) => {
        this.logger.error(
          `Failed to index document in Elasticsearch: ${err.message}`,
          err.stack,
        );
      });
  }

  /**
   * Performs a fuzzy search query in Elasticsearch.
   */
  public async searchFuzzy<T>(
    index: string,
    query: string,
    fields: string[],
  ): Promise<T[]> {
    try {
      const result = await this.elasticsearchService.search({
        index,
        query: {
          multi_match: {
            query,
            fields,
            fuzziness: 'AUTO',
          },
        },
      });

      if (!result.hits || !result.hits.hits) {
        return [];
      }

      return result.hits.hits.map((hit) => hit._source as T);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Elasticsearch search failed: ${err.message}`,
        err.stack,
      );
      // Fallback or empty array returning logic here
      return [];
    }
  }

  /**
   * Delete a document from the index.
   */
  public removeDocument(index: string, id: string): void {
    this.elasticsearchService
      .delete({
        index,
        id,
      })
      .catch((err: Error) => {
        this.logger.error(
          `Failed to delete document from Elasticsearch: ${err.message}`,
          err.stack,
        );
      });
  }
}
