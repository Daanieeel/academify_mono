import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]!) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const ip = getLocalIp();
console.log(`📡 Detected local IP: ${ip}`);

// Find all .env.example files
const output = execSync('find . -name ".env.example"', { encoding: 'utf-8' });
const files = output.trim().split('\n').filter(Boolean);

for (const file of files) {
  // Ignore files in node_modules or .git just in case
  if (file.includes('node_modules') || file.includes('.git')) {continue;}

  const targetFile = file.replace('.env.example', '.env');
  let content = readFileSync(file, 'utf-8');

  // Replace standard 'localhost' in URLs to the actual IP.
  // This helps Mobile/Expo and Better Auth redirect URLs point to the reachable LAN IP.
  content = content.replace(/http:\/\/localhost:(\d+)/g, `http://${ip}:$1`);
  content = content.replace(/http:\/\/127\.0\.0\.1:(\d+)/g, `http://${ip}:$1`);

  writeFileSync(targetFile, content);
  console.log(`✅ Generated ${targetFile}`);
}

console.log('🚀 Environment setup complete! Ready for local development.');
