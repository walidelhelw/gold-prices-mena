type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

type Context = Record<string, unknown>;

const levelWeight: Record<Level, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
};

const configuredLevel = (process.env.LOG_LEVEL?.toLowerCase() as Level) || "info";
const minWeight = levelWeight[configuredLevel] ?? levelWeight.info;

const write = (level: Level, context: Context, message: string) => {
  if (levelWeight[level] < minWeight) return;
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context
  };

  const line = JSON.stringify(payload);
  if (levelWeight[level] >= levelWeight.error) {
    console.error(line);
  } else {
    console.log(line);
  }
};

const withContext = (base: Context) => ({
  child: (extra: Context) => withContext({ ...base, ...extra }),
  trace: (context: Context, message: string) => write("trace", { ...base, ...context }, message),
  debug: (context: Context, message: string) => write("debug", { ...base, ...context }, message),
  info: (context: Context, message: string) => write("info", { ...base, ...context }, message),
  warn: (context: Context, message: string) => write("warn", { ...base, ...context }, message),
  error: (context: Context, message: string) => write("error", { ...base, ...context }, message),
  fatal: (context: Context, message: string) => write("fatal", { ...base, ...context }, message)
});

export const logger = withContext({ service: "gold-prices-mena" });
