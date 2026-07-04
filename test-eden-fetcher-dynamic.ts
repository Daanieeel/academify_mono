import { edenTreaty } from '@elysiajs/eden';
import http from 'http';

const server = http.createServer((req, res) => {
  console.log('Server received headers:', req.headers);
  res.end(JSON.stringify({ ok: true }));
});

let dynamicHeader = 'Value1';

server.listen(3035, async () => {
  const api = edenTreaty('http://localhost:3035', {
    fetcher: (url, init) => {
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          'X-Dynamic': dynamicHeader,
        },
      });
    },
  } as any);

  await api.me.get();
  dynamicHeader = 'Value2';
  await api.me.get();

  server.close();
});
