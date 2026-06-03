# 🌸 Diário de Emoções

Um app fofo, leve e responsivo para registrar como você se sente — todos os dias, sem julgamento.
Funciona como PWA (instala no celular como app nativo) e roda no desktop.

---

## ✨ Funcionalidades

| Tela          | O que faz                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| **Login**     | Email + senha · "Manter conectado" · Cadastro integrado                    |
| **Perfil**    | Avatar opcional (upload), nome, telefone, email                            |
| **Diário**    | 8 emoções (4 positivas, 4 negativas) · slider de intensidade 1–10 · texto livre |
| **Histórico** | Lista cronológica · gera PDF de cada entrada · envia por email             |

---

## 🧱 Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **TailwindCSS** com paleta pastel customizada (`blush`, `mint`, `lavender`, `butter`, `cream`)
- **Supabase** (Auth + Postgres + Storage com RLS)
- **Resend** para envio transacional de email
- **jsPDF** para gerar PDFs no client
- **lucide-react** para ícones
- **Quicksand** (display) + **Inter** (corpo) via `next/font`

---

## 🚀 Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto grátis em [supabase.com](https://supabase.com)
2. Abra **SQL Editor** → cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) → Run
3. Em **Settings → API**, copie a `Project URL` e a `anon public key`
4. Em **Authentication → URL Configuration**, adicione `http://localhost:3000/auth/callback` como Redirect URL
5. (Opcional, dev) Em **Authentication → Providers → Email**, desabilite "Confirm email" para testar mais rápido

### 3. Configurar Resend

1. Crie conta grátis em [resend.com](https://resend.com)
2. Em **API Keys**, gere uma key
3. Em produção, verifique seu domínio em **Domains** (em dev pode usar `onboarding@resend.dev`)

### 4. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 5. Rodar

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

---

## 🗂️ Estrutura

```
diario_emocoes/
├── supabase/
│   └── schema.sql              # Tabelas, RLS, trigger de profile, bucket de avatares
├── public/
│   └── manifest.json           # PWA manifest
└── src/
    ├── middleware.ts           # Refresh de sessão + redirect auth
    ├── app/
    │   ├── layout.tsx          # Fonts + metadata
    │   ├── page.tsx            # Redirect → /login ou /diario
    │   ├── globals.css         # Tailwind + componentes utilitários
    │   ├── login/page.tsx      # Login/Signup com toggle remember-me
    │   ├── auth/callback/      # OAuth/email callback
    │   ├── api/send-pdf/       # Server route: gera email com PDF anexo (Resend)
    │   └── (app)/              # Grupo protegido com bottom nav
    │       ├── layout.tsx
    │       ├── perfil/         # Aba Perfil + ProfileForm
    │       ├── diario/         # Aba Diário + DiaryForm
    │       └── historico/      # Aba Histórico + HistoryList + ShareDialog
    ├── components/
    │   ├── BottomNav.tsx       # Nav inferior flutuante com 3 abas
    │   ├── DiaryEntryCard.tsx  # Card de entrada no histórico
    │   └── LogoutButton.tsx
    ├── lib/
    │   ├── emotions.ts         # As 8 emoções + metadados (cores, emoji)
    │   ├── pdf.ts              # Geração de PDF com jsPDF
    │   └── supabase/           # Clients (browser, server, middleware)
    └── types/
        └── database.types.ts   # Tipos Profile, DiaryEntry, Emotion
```

---

## 🧠 Arquitetura

### Fluxo de dados

```
┌─────────────┐                ┌──────────────┐                ┌────────────┐
│ React/Next  │  ──signin──▶   │   Supabase   │  ──RLS──▶      │  Postgres  │
│  (client)   │  ──insert──▶   │     Auth     │                │  profiles  │
│             │  ──select──▶   │   + Storage  │                │  diary_*   │
└──────┬──────┘                └──────────────┘                └────────────┘
       │
       │ POST /api/send-pdf  ┌──────────────┐  ┌──────────┐
       └────────────────────▶│ Next Route   │─▶│  Resend  │─▶  email + PDF anexo
                             │ (server)     │  │   API    │
                             └──────────────┘  └──────────┘
```

### Modelo de dados

**`profiles`** — 1 por usuário, criada automaticamente via trigger no signup

| Coluna       | Tipo          | Notas                              |
| ------------ | ------------- | ---------------------------------- |
| `id`         | uuid PK       | FK → `auth.users.id`               |
| `name`       | text          | Editável pelo usuário              |
| `phone`      | text          | Editável                           |
| `email`      | text          | Preenchido no signup, editável     |
| `avatar_url` | text          | URL pública do bucket `avatars/`   |
| `updated_at` | timestamptz   |                                    |

**`diary_entries`** — N por usuário, indexada por `(user_id, created_at desc)`

| Coluna       | Tipo          | Notas                          |
| ------------ | ------------- | ------------------------------ |
| `id`         | uuid PK       | `gen_random_uuid()`            |
| `user_id`    | uuid FK       | `auth.users.id`                |
| `emotion`    | text          | Um de 8 valores (ver abaixo)   |
| `intensity`  | int (1–10)    | Constraint `check`             |
| `text`       | text nullable | Texto livre opcional           |
| `created_at` | timestamptz   | `now()`                        |

**Storage** — bucket `avatars/` (público), com policy de path-prefix por `user_id`.

**RLS** — todas as policies restringem leitura/escrita a `auth.uid() = user_id` (ou `id` em `profiles`). Não há como um usuário ler dados de outro.

### As 8 emoções

| Tom        | ID         | Emoji | Cor base   |
| ---------- | ---------- | ----- | ---------- |
| Positiva   | `feliz`    | 😊    | butter     |
| Positiva   | `grato`    | 🥰    | blush      |
| Positiva   | `calmo`    | 😌    | mint       |
| Positiva   | `animado`  | 🤩    | lavender   |
| Negativa   | `triste`   | 😔    | blue       |
| Negativa   | `ansioso`  | 😰    | purple     |
| Negativa   | `irritado` | 😤    | red        |
| Negativa   | `cansado`  | 😴    | gray       |

Definidas em [`src/lib/emotions.ts`](src/lib/emotions.ts) — adicionar/remover é trivial.

### "Manter conectado"

- **Marcado** (default) — Supabase usa cookies persistentes; sessão sobrevive ao fechar o navegador.
- **Desmarcado** — registramos um listener `beforeunload` que faz `signOut()` ao fechar a aba, então a sessão não persiste.

### PDF + email

1. No `ShareDialog`, geramos o PDF no **client** com `jsPDF` (sem custo de banco).
2. Convertemos para base64 e enviamos para `/api/send-pdf` junto com o email do destinatário.
3. O route handler valida sessão, valida email, e chama `resend.emails.send()` com o PDF como anexo.

Também há um botão "Só baixar o PDF" caso o usuário não queira enviar por email.

---

## 🎨 Design

| Elemento       | Escolha                                                       |
| -------------- | ------------------------------------------------------------- |
| Paleta         | Pastéis: blush, mint, lavender, butter sobre fundo cream      |
| Tipografia     | Quicksand (display, arredondada) + Inter (corpo)              |
| Border radius  | `rounded-3xl` / `rounded-full` por padrão (nada angular)      |
| Sombras        | Soft (rosa muito sutil) — `shadow-soft`, `shadow-soft-lg`     |
| Animações      | `fade-in`, `slide-up`, `pop` (todas <500ms, easing suave)     |
| Bottom nav     | Flutuante, redonda, com indicador animado da aba ativa        |
| Slider         | Custom CSS — gradiente blush → blush, thumb branca com sombra |

---

## 📱 PWA

O `manifest.json` já está configurado. Para ícones, adicione:

- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)

(Dica: use [maskable.app](https://maskable.app) para gerar.)

No iOS e Android, o usuário pode "Adicionar à tela inicial" e o app abre standalone.

---

## 🚢 Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

Adicione as 4 env vars no dashboard da Vercel (Settings → Environment Variables). No Supabase, adicione `https://seu-dominio.vercel.app/auth/callback` aos Redirect URLs.

---

## 🛠️ Próximos passos (opcionais)

- [ ] Gráfico de emoções por semana/mês (recharts)
- [ ] Lembretes diários via push notification
- [ ] Export do histórico completo (CSV)
- [ ] Modo escuro
- [ ] OAuth (Google/Apple) — basta habilitar no Supabase
- [ ] Tags livres por entrada
- [ ] Service worker para offline real

---

Feito com carinho 🌸
