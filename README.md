# CRM BOS/Moskit Clone — versão funcional completa (local + Supabase)

Aplicativo CRM multi-tenant inspirado no BOS e em fluxos do Moskit, com:
- dashboard (KPIs, donuts, funil, mapa)
- pipeline Kanban com drag-and-drop
- onboarding de organização
- fluxo admin de aprovação de usuários
- ingestão de leads de WhatsApp + Facebook Ads com classificação por IA
- migration Supabase com RLS + RPCs para onboarding e integrações

## Stack
- React + TypeScript + Vite
- Tailwind CSS v3
- dnd-kit
- Recharts
- react-simple-maps
- Supabase (Auth + Postgres + RLS)

## Estrutura de componentes (shadcn)
Este projeto usa estrutura compatível com shadcn em `src/components/ui`.

## Automação WhatsApp + IA + Facebook Ads
- Página: `/settings`
- Recursos:
  - toggle para automação WhatsApp
  - toggle para ingestão de Facebook Ads
  - toggle para classificação/score por IA
  - toggle para auto-assign entre perfis SALES e ATENDIMENTO
  - formulário para simular webhook de entrada e criar lead no CRM
- Persistência real: RPC `ingest_external_lead` na migration `202602230002_integrations_and_roles.sql`.

## Executar
```bash
npm install
npm run dev
```

## Variáveis
Crie `.env`:
```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

## Banco
Migrations (ordem):
1. `supabase/migrations/202602230001_init_crm.sql`
2. `supabase/migrations/202602230002_integrations_and_roles.sql`

Aplicar:
```bash
supabase db push
```

## Rotas
- `/auth`
- `/onboarding`
- `/crm/dashboard`
- `/crm/pipeline`
- `/crm/leads`
- `/crm/contatos`
- `/admin/users`
- `/settings`
