import { spawn } from 'node:child_process';

const env = { ...process.env };
for (const key of [
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'http_proxy',
  'https_proxy',
  'NPM_CONFIG_PROXY',
  'NPM_CONFIG_HTTPS_PROXY',
  'NPM_CONFIG_HTTP_PROXY',
  'npm_config_proxy',
  'npm_config_https_proxy',
  'npm_config_http_proxy',
]) {
  delete env[key];
}

const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env });
    child.on('close', (code) => resolve(code ?? 1));
  });

console.log('🧹 Limpando proxy de ambiente para instalação...');

for (const key of ['proxy', 'https-proxy', 'http-proxy']) {
  await run('npm', ['config', 'delete', key]);
}

const code = await run('npm', ['install']);
process.exit(code);
