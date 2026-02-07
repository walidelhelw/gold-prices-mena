export type DataRouterJobType =
  | "window-poll"
  | "daily-sync"
  | "reconcile-all"
  | "health-scan"
  | "manual-refresh";

export type DataRouterPayload = {
  sourceId: string;
  jobType: DataRouterJobType;
  countryCode?: string | null;
  citySlug?: string | null;
  entityKey?: string | null;
  runId?: string | null;
};

export type ConnectorEntity = {
  key: string;
  displayName: string;
};

export type ConnectorResult = {
  success: boolean;
  entityKey: string;
  syncedAt: string;
  recordsUpserted: number;
  message?: string;
};

export interface Connector {
  sourceId: string;
  listEntities(): Promise<ConnectorEntity[]>;
  syncEntity(entityKey: string, options?: DataRouterPayload): Promise<ConnectorResult>;
  invalidateCache(entityKey: string): Promise<void>;
}
