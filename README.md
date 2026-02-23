# CRM BOS/Moskit Clone — versão funcional única

Aplicativo CRM multi-tenant inspirado no BOS e em fluxos do Moskit, com:
- dashboard (KPIs, donuts, funil, mapa)
- pipeline Kanban com drag-and-drop
- onboarding de organização
- fluxo admin de aprovação de usuários
- integração simulada com WhatsApp + Facebook Ads + classificação por IA
- migration Supabase com RLS + RPCs para evitar erros clássicos de onboarding

## Stack
- React + TypeScript + Vite
- Tailwind CSS v3
- dnd-kit
- Recharts
- react-simple-maps
- Supabase (Auth + Postgres + RLS)

## Estrutura de componentes (shadcn)
Este projeto usa estrutura compatível com shadcn em `src/components/ui`.

Se você criar novos componentes via CLI do shadcn, mantenha esse caminho para preservar consistência com imports e aliases (`@/components/ui/...`).

## Automação WhatsApp + IA + Facebook Ads
- Página: `/settings`
- Recursos:
  - toggle para automação WhatsApp
  - toggle para ingestão de Facebook Ads
  - toggle para classificação/score por IA
  - toggle para auto-assign entre perfis SALES e ATENDIMENTO
  - formulário para simular webhook de entrada e criar lead no CRM
- Leads processados entram com origem/campanha, classificação e resumo de IA.

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

> Se o Supabase não estiver configurado, a app entra em fallback local para autenticação/onboarding e ainda permite navegar e testar o CRM.

## Banco
A migration está em:
- `supabase/migrations/202602230001_init_crm.sql`

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
