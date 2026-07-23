<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Meta-Metrics

Dashboard de métricas de **Meta Ads + Instagram/Facebook orgânico**: consome a Graph API da Meta e apresenta KPIs, gráficos de gasto/seguidores, tabela de campanhas e grade de posts. As rotas de API server-side (`/api/*`) chamam a Graph API com os tokens (nunca expostos ao cliente) e o frontend consome esses endpoints internos.

> `CLAUDE.md` apenas referencia este arquivo (`@AGENTS.md`) — mantenha a documentação aqui, sem duplicar.

## Stack
- **Linguagem:** TypeScript 5 (`strict`).
- **Framework:** **Next.js 16.2.2** (App Router, `src/app/`) com **React 19.2**. Atenção: esta versão do Next tem quebras — consulte `node_modules/next/dist/docs/` antes de codar (ver bloco no topo).
- **UI/estilo:** Tailwind CSS 4 (via `@tailwindcss/postcss`); `recharts` (gráficos), `lucide-react` (ícones), `class-variance-authority` + `clsx` + `tailwind-merge` (variantes de classe).
- **Fonte de dados:** Meta Graph API (Ads + Instagram/Facebook) — não há banco de dados próprio.
- **Package manager:** npm (`package-lock.json`).
- **Deploy:** Vercel (projeto Next padrão; auto-deploy da `main`).

## Comandos
- `npm install` — instala dependências.
- `npm run dev` — servidor de desenvolvimento Next (http://localhost:3000).
- `npm run build` — build de produção.
- `npm start` — serve o build de produção.
- `npm run lint` — ESLint (`eslint-config-next`).
- **Typecheck:** não há script dedicado; use `npx tsc --noEmit` (ou confie no `next build`, que faz type-check).
- **Testes:** não há (ver seção Testes).

## Estrutura
- `src/app/layout.tsx` — layout raiz (fontes, shell).
- `src/app/page.tsx` — dashboard principal (consome `/api/ads` e `/api/profile`).
- `src/app/ads/`, `src/app/organic/`, `src/app/profile/` — páginas por eixo (ads pagos, orgânico, perfil).
- `src/app/api/ads/route.ts`, `api/organic/route.ts`, `api/profile/route.ts` — route handlers que chamam a Graph API.
- `src/app/api/health/route.ts` — health check que reporta **quais envs estão setadas** (booleano, sem vazar valores).
- `src/lib/meta-api.ts` — cliente Meta Ads/Facebook (lê tokens de `process.env`; usa `next: { revalidate: 300 }`).
- `src/lib/instagram-api.ts` — cliente Instagram (mesma cache de 5 min).
- `src/lib/utils.ts` — helpers (ex.: `cn` com `clsx`/`tailwind-merge`).
- `src/components/` — `KpiCard`, `SpendChart`, `FollowerChart`, `CampaignTable`, `PostGrid`, `DateRangePicker`, `Sidebar`, `LoadingSpinner`.
- `next.config.ts` — config (mínima hoje). `public/` — SVGs.

## Convenções de código
- TypeScript `strict`; App Router com Server Components por padrão — só marque `"use client"` quando houver estado/efeito no cliente (as páginas que fazem `fetch` no browser são client).
- **Toda chamada à Graph API acontece no servidor** (`src/lib/*` e `route.ts`); o cliente só consome `/api/*` internos. Nunca mova tokens para o cliente.
- Cache de dados externos via `fetch(..., { next: { revalidate: 300 } })` — 5 min; ajuste conscientemente.
- Composição de classes com `cn()` (clsx + tailwind-merge); variantes com `class-variance-authority`.
- Rode `npm run lint` antes do PR.

## Variáveis de ambiente
Lidas em `src/lib/meta-api.ts`, `src/lib/instagram-api.ts` e `src/app/api/health/route.ts` (apenas **nomes**, nunca valores):
- `META_ACCESS_TOKEN` — token da Graph API (Ads/Facebook; também fallback para Instagram).
- `INSTAGRAM_ACCESS_TOKEN` — token específico do Instagram (fallback).
- `META_APP_ID`, `META_APP_SECRET` — app credentials (usados p/ montar `appsecret_proof`).
- `AD_ACCOUNT_ID` — conta de anúncios (há default hardcoded `act_…` no código).
- `FACEBOOK_PAGE_ID` — página do Facebook (há default hardcoded).
- `IG_BUSINESS_ACCOUNT_ID` / `INSTAGRAM_ACCOUNT_ID` — conta business do Instagram.

Configurar em `.env.local` (dev) e no **painel da Vercel** (prod). `.env*` e `.env*.local` estão no `.gitignore` — **nunca** commitar tokens. Use `GET /api/health` para checar quais envs estão setadas sem revelá-las.

## CI/CD & Deploy
- **Sem workflows** em `.github/workflows/` hoje. Deploy é **Vercel auto-deploy da `main`**.
- **CI mínimo recomendado (via PR)** em `.github/workflows/ci.yml`: `npm ci` → `npm run lint` → `npx tsc --noEmit` → `npm run build`. Isso evita quebrar a `main`, já que ela publica em produção.

## Boas práticas de PR
- Branches: `feat/…`, `fix/…`, `chore/…`.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…).
- PRs pequenos. Checklist:
  - `npm run lint`, `tsc --noEmit` e `npm run build` passam;
  - nenhum token/`.env` no diff (grep por `META_`, `INSTAGRAM_`, `access_token`);
  - screenshots de antes/depois para mudanças de dashboard/UI;
  - se adicionar env nova, atualizar este arquivo e o `/api/health`.
- Pelo menos 1 review; squash merge; `main` sempre deployável.

## Testes
- Não há testes hoje.
- Recomendação proporcional: adicionar **Vitest** para a camada `src/lib/*` (parsing/normalização das respostas da Graph API), que é onde mora a lógica. Para os route handlers, um teste de contrato mockando `fetch` cobre regressões sem bater na API real.

## Segurança & dados
- **Tokens da Meta são altamente sensíveis** — só no servidor, só via `process.env`, nunca em Client Components nem no bundle. Não logue tokens nem `appsecret_proof`.
- `/api/health` foi desenhado para reportar presença de envs como booleano — mantenha esse padrão, não exponha valores.
- Métricas podem conter dados de audiência/posts — evite persistir/logar dados pessoais (LGPD).
- Revisar dependências (`npm audit`); manter `next`/`eslint-config-next` na mesma minor.

## Gotchas
- **Next.js 16 + React 19:** APIs e convenções diferem de versões anteriores — leia `node_modules/next/dist/docs/` antes de mudar app/router/config (ver bloco no topo).
- **Defaults hardcoded:** `AD_ACCOUNT_ID`, `FACEBOOK_PAGE_ID`, `IG_BUSINESS_ACCOUNT_ID` têm valores fallback no código; em produção, defina as envs explicitamente para não usar contas erradas.
- **Cache de 5 min (`revalidate: 300`)**: dados não são em tempo real; ao depurar "número desatualizado", considere o cache antes de suspeitar da API.
- Tokens da Graph API expiram — falhas 190/OAuth costumam ser token vencido, não bug de código; cheque `/api/health` primeiro.
- Tailwind 4 usa `@tailwindcss/postcss` (config diferente do Tailwind 3) — não misture convenções antigas.
