# CryptoBroker — Vercel Deployment Guide

## 1. Supabase — przygotowanie bazy danych

Masz już tabele i RLS. Zostało dodać brakujące RPCs i trigger auto-profile.

### Uruchom skrypt SQL

Otwórz **Supabase Dashboard → SQL Editor → New query**, wklej zawartość pliku `supabase/rpcs.sql` i kliknij **Run**.

Skrypt tworzy:

- **`handle_new_user()`** — trigger `AFTER INSERT` na `auth.users`, automatycznie tworzy profil z $10,000 dla nowych użytkowników
- **`execute_trade_atomic()`** — otwiera pozycję atomowo (sprawdza margin, insertuje position)
- **`close_position_atomic()`** — zamyka pozycję, zapisuje P&L, tworzy transakcję (trigger zaktualizuje balance)
- **`add_demo_funds()`** — dodaje demo fundusze z limitem max balance

### Sprawdź ustawienia Auth

W **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://twoja-domena.vercel.app`
- **Redirect URLs**: dodaj:
  - `https://twoja-domena.vercel.app/auth/callback`
  - `https://twoja-domena.vercel.app/auth/callback?next=/reset-password`

> Bez poprawnych redirect URLs, potwierdzenie emaila i reset hasła nie będą działać.

### Włącz Realtime

W **Supabase Dashboard → Database → Replication**:

- Włącz **Realtime** dla tabel: `profiles`, `positions`

## 2. GitHub — przygotowanie repozytorium

Upewnij się, że kod jest na GitHubie:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TWOJ_USER/cfd-broker.git
git push -u origin main
```

Pliki `.env` i `.env.local` są w `.gitignore` — klucze NIE trafią do repo.

## 3. Vercel — deploy

### Opcja A: Dashboard (zalecane)

1. Otwórz [vercel.com/new](https://vercel.com/new)
2. Kliknij **Import Git Repository** i wybierz repo `cfd-broker`
3. Vercel automatycznie wykryje Next.js — nie zmieniaj ustawień buildu
4. W sekcji **Environment Variables** dodaj:

| Nazwa | Wartość |
|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://twoj-projekt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `twoj-anon-key` |

5. Kliknij **Deploy**

### Opcja B: CLI

```bash
npm i -g vercel
vercel login
vercel

# Przy pierwszym deploy odpowiedz na pytania:
# → Link to existing project? No
# → Project name: cfd-broker
# → Framework: Next.js (auto-detected)
# → Override settings? No
```

Dodaj zmienne środowiskowe:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

Deploy na produkcję:

```bash
vercel --prod
```

## 4. Po deploy — checklist

- [ ] Otwórz stronę i sprawdź czy się ładuje
- [ ] Zarejestruj konto testowe — sprawdź czy email confirmation działa
- [ ] Zaloguj się — sprawdź czy dashboard ładuje ceny z Binance
- [ ] Otwórz pozycję testową — sprawdź czy execute_trade_atomic działa
- [ ] Zamknij pozycję — sprawdź czy P&L się zapisuje
- [ ] Przetestuj reset hasła — sprawdź czy email przychodzi i link działa
- [ ] Dodaj demo fundusze — sprawdź czy balance się aktualizuje

## 5. Custom domain (opcjonalnie)

W Vercel Dashboard → Settings → Domains:

1. Dodaj swoją domenę
2. Skonfiguruj DNS (CNAME na `cname.vercel-dns.com`)
3. **Zaktualizuj Site URL i Redirect URLs w Supabase** na nową domenę

## Troubleshooting

**"Unauthorized" przy otwieraniu pozycji** — sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` i `ANON_KEY` są poprawne w Vercel env vars. Po zmianie env vars trzeba zrobić redeploy.

**Email confirmation nie działa** — sprawdź Redirect URLs w Supabase Auth. Musi być dokładnie `https://twoja-domena.vercel.app/auth/callback`.

**Balance nie zmienia się po close** — sprawdź czy trigger `on_transaction_created` istnieje (z `README.md` SQL setup) i czy RPC `close_position_atomic` jest wgrany (`supabase/rpcs.sql`).

**Nowy user nie ma profilu** — sprawdź czy trigger `on_auth_user_created` istnieje (z `supabase/rpcs.sql`).
