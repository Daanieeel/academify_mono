#!/bin/bash
sed -i '' 's/void this.handleSocketMessage(event.data);/console.log("WS MESSAGE:", event.data); void this.handleSocketMessage(event.data);/' packages/client-core/src/sync-client.ts
bun test packages/client-core/src/test/e2e.test.ts
