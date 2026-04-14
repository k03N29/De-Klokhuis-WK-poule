# De Klokhuis WK-Poule 2026 — Setup Gids

Volg deze stappen om de app online te zetten. Duurt ~20 minuten.

---

## Stap 1: Supabase database aanmaken

Supabase is de gratis database die de app gebruikt.

1. Ga naar **https://supabase.com** en klik **Start your project**
2. Maak een gratis account (met Google of GitHub is het snelst)
3. Klik **New project**
4. Vul in:
   - **Organization**: jouw naam of "De Klokhuis"
   - **Name**: `klokhuis-wk-poule`
   - **Database Password**: kies een wachtwoord (sla het op, maar je hebt het zelden nodig)
   - **Region**: kies `West EU (Ireland)` — dichtstbij Nederland
5. Klik **Create new project** en wacht ~2 minuten

---

## Stap 2: Database tabellen aanmaken

1. In je Supabase project: klik links op **SQL Editor**
2. Klik **New query**
3. Kopieer de inhoud van `supabase/schema.sql` en plak het in het editor-venster
4. Klik **Run** (of Ctrl+Enter)
5. Je ziet groen: "Success. No rows returned" — goed!
6. Maak nog een **New query**
7. Kopieer de inhoud van `supabase/seed.sql` en plak het in
8. Klik **Run** — nu zijn de 7 spelers en 48 landen aangemaakt

---

## Stap 3: API sleutels ophalen

1. In Supabase: klik links op **Project Settings** (tandwiel icoon)
2. Klik op **API** in het menu
3. Kopieer:
   - **Project URL** (begint met `https://...supabase.co`)
   - **anon public** key (lange rij letters/cijfers onder "Project API keys")

---

## Stap 4: .env.local bestand aanmaken

1. Ga naar de projectmap op je computer: `de-klokhuis-poule`
2. Kopieer het bestand `.env.local.example` en hernoem de kopie naar `.env.local`
3. Open `.env.local` met Kladblok/Notepad
4. Vul in:

```
NEXT_PUBLIC_SUPABASE_URL=https://jouw-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw-anon-key-hier
NEXT_PUBLIC_ADMIN_PASSWORD=klok2026
```

5. Sla op

---

## Stap 5: Lokaal testen (optioneel)

Open een terminal in de projectmap en type:

```bash
npm install
npm run dev
```

Open dan **http://localhost:3000** in je browser. Als je de login-pagina ziet: gelukt!

---

## Stap 6: Online zetten met Vercel

Vercel is de gratis hostingdienst die de app publiek toegankelijk maakt (via een URL).

### 6a: GitHub repository aanmaken

1. Ga naar **https://github.com** en maak een account als je die nog niet hebt
2. Klik op **+** (rechtsboven) → **New repository**
3. Naam: `klokhuis-wk-poule`, zet op **Private**
4. Klik **Create repository**
5. Volg de instructies om de projectmap te uploaden:

```bash
# In de projectmap:
git init
git add .
git commit -m "De Klokhuis WK-Poule 2026"
git branch -M main
git remote add origin https://github.com/JOUW-NAAM/klokhuis-wk-poule.git
git push -u origin main
```

### 6b: Vercel koppelen

1. Ga naar **https://vercel.com** en maak een gratis account
2. Klik **Add New Project**
3. Koppel je GitHub account en kies de `klokhuis-wk-poule` repository
4. Klik **Import**
5. Bij **Environment Variables** voeg toe:
   - `NEXT_PUBLIC_SUPABASE_URL` → jouw Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → jouw Supabase anon key
   - `NEXT_PUBLIC_ADMIN_PASSWORD` → `klok2026`
6. Klik **Deploy**
7. Na ~2 minuten krijg je een URL: `klokhuis-wk-poule.vercel.app` 🎉

---

## Stap 7: De Draft uitvoeren

1. Ga naar `/admin` en log in met het wachtwoord (`klok2026`)
2. Ga naar de tab **Draft**
3. Klik **Naar de Draft pagina**
4. Iedereen in het huis opent de app en logt in
5. Spin om de beurt — elk persoon krijgt 4 landen
6. De draft is klaar als alle 28 picks gedaan zijn

---

## App-overzicht

| Pagina | URL | Wat |
|--------|-----|-----|
| Login | `/` | Wie ben je? |
| Dashboard | `/dashboard` | Ranglijst, bier drukken, jouw landen |
| Draft | `/draft` | Het Klok-Rad spinwiel |
| Admin | `/admin` | Alles beheren |
| Ad-wedstrijd | `/ad-wedstrijd` | Finale tie-breaker stopwatch |

---

## Punten systeem

| Actie | Punten |
|-------|--------|
| +1 Klokje drukken | 1 punt |
| Land wint | 3 punten voor eigenaar |
| Land gelijkspel | 1 punt voor eigenaar |
| Huis-land wint/gelijkspel | 0 punten, iedereen drinkt! |
| NL-voorspelling exact goed | 5 punten |
| NL-voorspelling toto goed | 3 punten |
| Club-bonus (Feyenoord/PSV/Groningen) | 1 punt voor eigenaar land |
| 24 punten | = 1 vol kratje De Klok 🍺 |

---

## Problemen?

- **Kan geen verbinding maken**: Check of `.env.local` correct is ingevuld
- **Namen niet zichtbaar**: Zorg dat je `supabase/seed.sql` hebt gedraaid
- **Wout overlay**: Verschijnt max 10 seconden na admin-knop (polling interval)
- **Draft werkt niet**: Check of `global_state` tabel bestaat en 1 rij heeft

Veel plezier en veel bier! 🍺🏆
