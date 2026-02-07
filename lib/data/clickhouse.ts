import "server-only";

type ClickHouseInsertOptions = {
  table: string;
  rows: Record<string, unknown>[];
};

const clickhouseUrl = process.env.CLICKHOUSE_URL;
const clickhouseUser = process.env.CLICKHOUSE_USERNAME;
const clickhousePassword = process.env.CLICKHOUSE_PASSWORD;

export const isClickHouseConfigured = () => Boolean(clickhouseUrl);

const request = async (query: string) => {
  if (!clickhouseUrl) return null;

  const endpoint = `${clickhouseUrl.replace(/\/$/, "")}/?query=${encodeURIComponent(query)}`;
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8"
  };

  if (clickhouseUser && clickhousePassword) {
    headers.Authorization = `Basic ${Buffer.from(`${clickhouseUser}:${clickhousePassword}`).toString("base64")}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  return response.text();
};

export const insertJsonEachRow = async ({ table, rows }: ClickHouseInsertOptions) => {
  if (!clickhouseUrl || rows.length === 0) return { inserted: 0, skipped: true };

  const payload = rows.map((row) => JSON.stringify(row)).join("\n");
  const query = `INSERT INTO ${table} FORMAT JSONEachRow\n${payload}`;
  const result = await request(query);

  return {
    inserted: result === null ? 0 : rows.length,
    skipped: result === null
  };
};
