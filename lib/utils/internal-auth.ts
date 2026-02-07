import { createHmac, timingSafeEqual } from "crypto";

const getSecret = () => process.env.INTERNAL_API_SECRET ?? process.env.CRON_SECRET ?? "";

const safeCompare = (a: string, b: string) => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

const verifyHmac = (payload: string, timestamp: string, signature: string, secret: string) => {
  if (!timestamp || !signature || !secret) return false;
  const ageMs = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(ageMs) || ageMs > 5 * 60_000) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return safeCompare(digest, signature);
};

export const verifyInternalAuth = (request: Request, payload = "") => {
  const secret = getSecret();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const signature = request.headers.get("x-internal-signature") ?? "";
  const timestamp = request.headers.get("x-internal-timestamp") ?? "";

  return verifyHmac(payload, timestamp, signature, secret);
};
