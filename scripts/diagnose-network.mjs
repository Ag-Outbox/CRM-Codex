import { execSync } from 'node:child_process';
import https from 'node:https';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
  } catch (error) {
    return `ERROR: ${error.message}`;
  }
}

console.log('== npm config ==');
console.log('registry:', run('npm config get registry'));
console.log('proxy:', run('npm config get proxy'));
console.log('https-proxy:', run('npm config get https-proxy'));

console.log('\n== env proxy vars ==');
for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy']) {
  console.log(`${key}:`, process.env[key] ?? '(not set)');
}

console.log('\n== registry connectivity ==');
const targets = ['https://registry.npmjs.org/', 'https://registry.npmjs.org/@supabase%2fsupabase-js'];

await Promise.all(
  targets.map(
    (url) =>
      new Promise((resolve) => {
        https
          .get(url, (res) => {
            console.log(`${url} -> ${res.statusCode}`);
            res.resume();
            resolve();
          })
          .on('error', (err) => {
            console.log(`${url} -> ERROR: ${err.message}`);
            resolve();
          });
      }),
  ),
);

console.log('\nSe status for 403, a rede/política corporativa está bloqueando o registry.');
