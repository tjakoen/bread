// /framework/http/stream.ts — generic per-session SSE hub. ZERO app knowledge.
//
// Server-Sent Events let the server PUSH to the browser without a refresh. htmx is
// client-initiated (request→swap); this is the additive piece that lets work the
// client never asked for — an async reasoner result, a background worker — land on
// the page. One subscriber set per session id; push to one, or broadcast to all.
//
// Reusable: it knows nothing about intents, render ops, or the app. The app layer
// decides WHAT to push; this just carries opaque JSON-serialisable payloads.

type Controller = ReadableStreamDefaultController<Uint8Array>;

export interface Stream {
  /** A `text/event-stream` Response the browser opens with `new EventSource(url)`. */
  subscribe(sessionId: string): Response;
  /** Push a named event to one session (no-op if nobody is listening on it). */
  push(sessionId: string, event: string, data: unknown): void;
  /** Push a named event to every open session. */
  broadcast(event: string, data: unknown): void;
}

export function createStream(): Stream {
  const enc = new TextEncoder();
  const sessions = new Map<string, Set<Controller>>();

  const frame = (event: string, data: unknown) =>
    enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  function emit(set: Set<Controller>, event: string, data: unknown) {
    const chunk = frame(event, data);
    for (const c of set) {
      try { c.enqueue(chunk); } catch { set.delete(c); }   // closed tab → drop quietly
    }
  }

  function subscribe(sessionId: string): Response {
    let self: Controller | undefined;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        self = controller;
        const set = sessions.get(sessionId) ?? new Set<Controller>();
        set.add(controller);
        sessions.set(sessionId, set);
        controller.enqueue(enc.encode(`: connected\n\n`));   // comment frame: opens the stream
      },
      cancel() {
        const set = sessions.get(sessionId);
        if (!set || !self) return;
        set.delete(self);
        if (set.size === 0) sessions.delete(sessionId);
      },
    });
    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  }

  function push(sessionId: string, event: string, data: unknown) {
    const set = sessions.get(sessionId);
    if (set) emit(set, event, data);
  }

  function broadcast(event: string, data: unknown) {
    for (const set of sessions.values()) emit(set, event, data);
  }

  return { subscribe, push, broadcast };
}
