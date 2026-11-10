export const CODE_VALIDITY_SECONDS = 10 * 60;

/** Seconds left for a code sent at `sentAtSeconds` (Unix time); a missing or bogus value counts as "just sent". */
export function remainingCodeSeconds(sentAtSeconds: number, nowMs: number = Date.now()): number {
  if (!Number.isFinite(sentAtSeconds)) return CODE_VALIDITY_SECONDS;
  const elapsed = Math.floor(nowMs / 1000) - sentAtSeconds;
  return CODE_VALIDITY_SECONDS - Math.min(Math.max(0, elapsed), CODE_VALIDITY_SECONDS);
}
