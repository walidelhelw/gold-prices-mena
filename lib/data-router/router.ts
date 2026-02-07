import "server-only";

import { getConnector } from "@/lib/data-router/connectors";
import { acquireLock, releaseLock } from "@/lib/data-router/locks";
import { appendRunStep, createRun, finishRun } from "@/lib/data-router/runs";
import { logger } from "@/lib/logger";
import type { DataRouterPayload } from "@/lib/data-router/types";

export const executeDataRun = async (payload: DataRouterPayload) => {
  const runMeta = await createRun({
    sourceId: payload.sourceId,
    jobType: payload.jobType,
    countryCode: payload.countryCode,
    citySlug: payload.citySlug
  });

  const runLogger = logger.child({ runId: runMeta.runId, sourceId: payload.sourceId });
  const connector = getConnector(payload.sourceId);

  if (!connector) {
    await finishRun({
      runId: runMeta.runId,
      status: "failed",
      recordsUpserted: 0,
      errorMessage: `Unknown source: ${payload.sourceId}`
    });

    runLogger.error({ payload }, "Data router source not found");
    return {
      ok: false,
      runId: runMeta.runId,
      error: `Unknown source: ${payload.sourceId}`
    };
  }

  const entities = payload.entityKey
    ? [{ key: payload.entityKey, displayName: payload.entityKey }]
    : await connector.listEntities();

  let totalUpserts = 0;
  let failures = 0;

  for (const entity of entities) {
    const lockKey = `datarouter:${payload.sourceId}:${entity.key}`;
    const lockAcquired = await acquireLock(lockKey, 120);

    if (!lockAcquired) {
      await appendRunStep({
        runId: runMeta.runId,
        level: "warn",
        message: `Skipped locked entity ${entity.key}`,
        data: { entityKey: entity.key }
      });
      continue;
    }

    try {
      const result = await connector.syncEntity(entity.key, payload);
      totalUpserts += result.recordsUpserted;

      await appendRunStep({
        runId: runMeta.runId,
        level: result.success ? "info" : "warn",
        message: result.message ?? "Entity sync completed",
        data: {
          entityKey: entity.key,
          success: result.success,
          recordsUpserted: result.recordsUpserted,
          syncedAt: result.syncedAt
        }
      });

      if (!result.success) {
        failures += 1;
      }

      await connector.invalidateCache(entity.key);
    } catch (error) {
      failures += 1;
      await appendRunStep({
        runId: runMeta.runId,
        level: "error",
        message: `Entity sync failed: ${entity.key}`,
        data: {
          entityKey: entity.key,
          error: error instanceof Error ? error.message : "unknown error"
        }
      });

      runLogger.error(
        {
          entityKey: entity.key,
          error: error instanceof Error ? error.message : "unknown error"
        },
        "Data router entity sync failed"
      );
    } finally {
      await releaseLock(lockKey);
    }
  }

  const status = failures === 0 ? "completed" : failures < entities.length ? "partial" : "failed";
  await finishRun({
    runId: runMeta.runId,
    status,
    recordsUpserted: totalUpserts,
    errorMessage: failures > 0 ? `${failures} entities failed` : undefined
  });

  runLogger.info(
    {
      jobType: payload.jobType,
      entityCount: entities.length,
      failures,
      recordsUpserted: totalUpserts,
      status
    },
    "Data router run completed"
  );

  return {
    ok: status !== "failed",
    runId: runMeta.runId,
    status,
    entityCount: entities.length,
    failures,
    recordsUpserted: totalUpserts
  };
};
