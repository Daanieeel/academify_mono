import { edenTreaty } from '@elysiajs/eden';
const api = edenTreaty('url', {
  headers: () => ({ Authorization: '...' }),
});
