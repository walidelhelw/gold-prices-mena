import { getFeaturedCities } from "@/lib/data/dealers-server";
import { runIngestionPipeline } from "@/lib/data/ingestion-service";
import { logger } from "@/lib/logger";
import type { Connector, ConnectorResult } from "@/lib/data-router/types";

export class DealerConnector implements Connector {
  sourceId = "dealer-quotes";

  async listEntities() {
    const countryCities = ["eg", "sa", "ae"].flatMap((countryCode) =>
      getFeaturedCities(countryCode).map((city) => ({
        key: `${countryCode}:${city.slug}`,
        displayName: `${countryCode.toUpperCase()} - ${city.name_en}`
      }))
    );

    return countryCities;
  }

  async syncEntity(entityKey: string): Promise<ConnectorResult> {
    const [countryCode, citySlug] = entityKey.split(":");
    const result = await runIngestionPipeline({ countryCode, citySlug });

    logger.info(
      {
        sourceId: this.sourceId,
        entityKey,
        insertedQuotes: result.insertedQuotes,
        failed: result.failed
      },
      "Data router sync executed"
    );

    return {
      success: result.failed === 0,
      entityKey,
      syncedAt: result.finishedAt,
      recordsUpserted: result.insertedQuotes,
      message: result.failed === 0 ? "sync ok" : "sync partial"
    };
  }

  async invalidateCache(entityKey: string) {
    logger.info({ sourceId: this.sourceId, entityKey }, "Cache invalidation requested");
  }
}
