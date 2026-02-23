import { existsSync, readFileSync } from 'node:fs';

const checks = [];

checks.push({
  name: '.env exists',
  ok: existsSync('.env'),
  hint: 'Copie .env.example para .env e preencha as variáveis do Supabase.',
});

checks.push({
  name: 'base migration exists',
  ok: existsSync('supabase/migrations/202602230001_init_crm.sql'),
  hint: 'Arquivo base de schema não encontrado.',
});

checks.push({
  name: 'integration migration exists',
  ok: existsSync('supabase/migrations/202602230002_integrations_and_roles.sql'),
  hint: 'Arquivo de integração não encontrado.',
});

if (existsSync('.env')) {
  const env = readFileSync('.env', 'utf8');
  checks.push({
    name: 'VITE_SUPABASE_URL configured',
    ok: /VITE_SUPABASE_URL=https:\/\//.test(env) && !env.includes('YOUR_PROJECT'),
    hint: 'Defina uma URL real do projeto Supabase.',
  });
  checks.push({
    name: 'VITE_SUPABASE_ANON_KEY configured',
    ok: /VITE_SUPABASE_ANON_KEY=/.test(env) && !env.includes('YOUR_SUPABASE_ANON_KEY'),
    hint: 'Defina a anon key real do Supabase.',
  });
}

let failed = 0;
for (const c of checks) {
  if (c.ok) {
    console.log(`✅ ${c.name}`);
  } else {
    failed += 1;
    console.log(`❌ ${c.name} — ${c.hint}`);
  }
}

console.log('\nPróximos comandos:');
console.log('1) npm install');
console.log('2) supabase db push');
console.log('3) npm run dev');

if (failed > 0) {
  process.exitCode = 1;
}
