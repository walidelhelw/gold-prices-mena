import "server-only";

import { randomUUID } from "crypto";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/supabase/server";

export const createRun = async (payload: {
  sourceId: string;
  jobType: string;
  countryCode?: string | null;
  citySlug?: string | null;
}) => {
  const runId = randomUUID();
  const now = new Date().toISOString();

  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      await supabase.from("data_runs").insert({
        id: runId,
        source_id: payload.sourceId,
        job_type: payload.jobType,
        country_code: payload.countryCode ?? null,
        city_slug: payload.citySlug ?? null,
        status: "running",
        started_at: now,
        created_at: now,
        updated_at: now
      });
    }
  }

  return { runId, startedAt: now };
};

export const appendRunStep = async (payload: {
  runId: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: Record<string, unknown>;
}) => {
  if (!isSupabaseServerConfigured()) return;
  const supabase = getSupabaseServer();
  if (!supabase) return;

  await supabase.from("data_run_steps").insert({
    run_id: payload.runId,
    level: payload.level,
    message: payload.message,
    data: payload.data ?? {},
    created_at: new Date().toISOString()
  });
};

export const finishRun = async (payload: {
  runId: string;
  status: "completed" | "partial" | "failed";
  recordsUpserted: number;
  errorMessage?: string;
}) => {
  if (!isSupabaseServerConfigured()) return;
  const supabase = getSupabaseServer();
  if (!supabase) return;

  await supabase
    .from("data_runs")
    .update({
      status: payload.status,
      records_upserted: payload.recordsUpserted,
      error_message: payload.errorMessage ?? null,
      finished_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", payload.runId);
};
