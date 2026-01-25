// src/lib/events.ts
type ZsEvent =
  | { type: "api:mutated"; path?: string; method?: string; at: number }
  | { type: "pos:mutated"; at: number }
  | { type: "auth:unauthorized"; at: number };

const CHANNEL = "zs-events";

// evita spam si se hacen muchas llamadas seguidas
let lastEmit = 0;
const MIN_GAP_MS = 250;

export function emitZsEvent(ev: ZsEvent) {
  try {
    const now = Date.now();
    if (now - lastEmit < MIN_GAP_MS) return;
    lastEmit = now;

    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage(ev);
    ch.close();
  } catch {
    // no-op
  }
}
