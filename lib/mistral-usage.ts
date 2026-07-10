/**
 * Suivi de la consommation Mistral — insertion best-effort dans Supabase (table mistral_usage).
 * N'échoue jamais l'appelant : un souci de logging ne doit pas casser une génération.
 */

export type MistralUsageEntry = {
  source: string;
  model: string;
  endpoint?: 'chat' | 'audio';
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  success: boolean;
  httpStatus?: number | null;
  durationMs?: number | null;
};

export async function logMistralUsage(entry: MistralUsageEntry): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !key) return;

  try {
    await fetch(`${supabaseUrl}/rest/v1/mistral_usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        apikey: key,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        source: entry.source,
        model: entry.model,
        endpoint: entry.endpoint ?? 'chat',
        prompt_tokens: entry.promptTokens ?? null,
        completion_tokens: entry.completionTokens ?? null,
        total_tokens: entry.totalTokens ?? null,
        success: entry.success,
        http_status: entry.httpStatus ?? null,
        duration_ms: entry.durationMs ?? null,
      }),
    });
  } catch {
    // best-effort
  }
}

/** Extrait prompt/completion/total tokens d'une réponse chat/completions Mistral (format usage standard). */
export function usageFromMistralResponse(data: any): {
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
} {
  const usage = data?.usage;
  return {
    promptTokens: usage?.prompt_tokens ?? null,
    completionTokens: usage?.completion_tokens ?? null,
    totalTokens: usage?.total_tokens ?? null,
  };
}
