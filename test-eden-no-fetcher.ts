import { edenTreaty } from '@elysiajs/eden';
import http from 'http';

const server = http.createServer((req, res) => {
  console.log('Server received headers:', req.headers);
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3031, async () => {
  const api = edenTreaty('http://localhost:3031', {
    $fetch: {
      headers: { 'X-Test': 'Value' },
    },
  } as any);
  await api.me.get();
  server.close();
});
