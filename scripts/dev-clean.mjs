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

console.log('🚀 Iniciando dev server sem proxy de ambiente...');
const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit', env });
child.on('close', (code) => process.exit(code ?? 1));
