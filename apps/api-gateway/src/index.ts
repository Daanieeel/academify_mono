import { Elysia } from "elysia";
import { createSessionId } from "@repo/auth";
import { channelNames } from "@repo/redis";
import { presenceMessageSchema } from "@repo/sync-protocol";

const app = new Elysia()
  .get("/health", () => ({ ok: true, service: "api-gateway" }))
  .get("/session/:userId", ({ params }) => ({
    userId: params.userId,
    sessionId: createSessionId(params.userId),
    channel: channelNames.presence,
  }))
  .ws("/ws", {
    open(wsClient) {
      const initialMessage = presenceMessageSchema.parse({
        userId: "system",
        status: "online",
        at: new Date().toISOString(),
      });
      wsClient.send(JSON.stringify(initialMessage));
    },
    message(wsClient, raw) {
      const parsed = presenceMessageSchema.safeParse(JSON.parse(String(raw)));
      if (!parsed.success) {
        wsClient.send(JSON.stringify({ error: "invalid payload" }));
        return;
      }
      wsClient.send(JSON.stringify(parsed.data));
    },
  })
  .listen(Number(process.env.API_GATEWAY_PORT ?? 3001));

console.log(`API Gateway listening on ${app.server?.hostname}:${app.server?.port}`);
