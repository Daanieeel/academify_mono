import { edenTreaty } from '@elysiajs/eden';
const api = edenTreaty('http://localhost:3001', {
  fetcher: async (url, init) => {
    console.log('Fetcher called with headers:', init?.headers);
    return new Response(JSON.stringify({ ok: true }));
  },
  onRequest: (path, init) => {
    init.headers = { ...init.headers, 'X-Test': 'Value' };
  },
} as any);

async function test() {
  await api.me.get();
}
test();
