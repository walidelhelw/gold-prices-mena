import type { Connector } from "@/lib/data-router/types";
import { DealerConnector } from "@/lib/data-router/connectors/dealer-connector";

const connectors: Record<string, Connector> = {
  "dealer-quotes": new DealerConnector()
};

export const getConnector = (sourceId: string) => connectors[sourceId] ?? null;
