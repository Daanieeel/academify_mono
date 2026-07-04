import fs from 'fs';
const dts = fs.readFileSync(
  'node_modules/@elysiajs/eden/dist/index.d.ts',
  'utf-8',
);
const match = dts.match(/export declare const edenTreaty:[^]+?;/s);
console.log(match ? match[0] : 'Not found');
