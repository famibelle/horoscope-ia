# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Horoscope Karukera** is a Next.js 15 web application that generates culturally-anchored daily horoscopes for Guadeloupe, powered by the AI persona "Maryse CondAI" (inspired by the Guadeloupean Nobel-adjacent author Maryse Condé).

The platform combines:
- Western astrology with Guadeloupean Creole cultural elements (flora, fauna, locations, Vodou traditions)
- AI-generated horoscopes via Mistral AI API
- Text-to-Speech narration with Mistral Voxtral
- Newsletter delivery via Brevo/Sendinblue
- Cached horoscopes in Netlify Blobs

Key domains: daily horoscopes (4 editions: nuit/matin/midi/soir), articles, TTS audio, email newsletters, contact forms.

## Build & Development Commands

### Core Commands
- `npm run dev` — Launch Next.js dev server (localhost:3000)
- `npm run build` — Build for production (generates `.next/`)
- `npm run start` — Run production server
- `npm run lint` — Run ESLint

### Data Generation Scripts
These scripts parse reference data and generate type-safe TypeScript modules:
- `npm run flore:parse` — Parse Guadeloupe flora reference → `lib/private/flore-data.ts`
- `npm run faune:parse` — Parse fauna reference → `lib/private/faune-data.ts`
- `npm run lieux:parse` — Parse sacred locations → `lib/private/lieux-data.ts`
- `npm run kreyol:parse` — Parse Creole resistance symbols → `lib/private/kreyol-data.ts`
- `npm run histoire:parse` — Parse historical resonance → `lib/private/histoire-data.ts`
- `npm run data:parse` — Run all parse scripts above

### Horoscope Generation
These run during CI/CD (GitHub Actions) but can be run locally:
- `npx tsx scripts/generate-horoscopes.ts [--date=YYYY-MM-DD] [--force] [--signs=belier,lion]` — Generate daily horoscopes for all 12 signs
- `npx tsx scripts/generate-ambiances.ts` — Generate ambiance/energy scores per sign
- `npx tsx scripts/generate-presage-du-jour.ts` — Generate daily sign (flore/faune)

### Newsletter & Content
- `npm run generate-daily-newsletter` — Generate and send daily newsletter via Brevo
- `npm run test-newsletter-generator` — Test newsletter generation (dry-run)
- `npm run test-newsletter-templates` — Validate newsletter HTML templates
- `npm run test-brevo-connection` — Test Brevo API credentials
- `npm run send-brevo-test` — Send test email to verify delivery
- `npx tsx scripts/quality-report.ts` — Generate quality audit of recent horoscopes

### TTS & Audio
- `npm run generate-tts` — Pre-generate audio files for horoscopes
- `npm run clear-tts-cache` — Clear Netlify Blobs TTS cache

## Architecture

### Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 3.4, Framer Motion (animations)
- **AI/LLM**: Mistral AI (horoscope generation + TTS)
- **Database**: Supabase (PostgreSQL) for subscriber lists, email logs
- **Cache**: Netlify Blobs (horoscopes, TTS audio)
- **Email**: Brevo/Sendinblue API
- **Hosting**: Netlify with Next.js plugin
- **Weather**: Open-Meteo API (free, no auth)

### Directory Structure

```
app/
├── api/                          # API Routes (Next.js)
│   ├── horoscope/[sign]/        # GET horoscope for sign
│   ├── ambiance/[sign]/         # GET ambiance/energy scores
│   ├── presage-du-jour/         # GET daily sign (flore/faune)
│   ├── tts/                     # POST text→audio
│   ├── weather/                 # GET weather for Guadeloupe
│   ├── subscribe/               # POST email subscription
│   ├── newsletter/send/         # POST send newsletter
│   ├── contact/                 # POST contact form
│   └── horoscope/health/        # GET health check
├── horoscope/[sign]/            # Dynamic sign pages (SEO)
├── articles/[slug]/             # Article pages
├── layout.tsx                   # Root layout + metadata
├── page.tsx                     # Homepage
└── globals.css

lib/
├── signs-data.ts                # 12 zodiac signs (emoji, element, Creole data, etc.)
├── horoscope-data.ts            # HoroscopeResponse type, utilities
├── edition.ts                   # Time-of-day logic (Guadeloupe timezone)
├── cultural-context.ts          # Cultural data helpers
├── articles-data.ts             # Article metadata
├── articles-content.json        # Generated article content (Mistral)
├── newsletter-generator.ts      # Newsletter HTML generation
├── newsletter-templates.ts      # Email template components
├── brevo-api.ts                 # Brevo API wrapper
├── supabase.ts                  # Supabase client (JS)
├── supabase-rest.ts             # Supabase REST API (server-only)
└── private/                     # PRIVATE (secrets, prompts, data)
    ├── maryse-prompt.ts         # System + user prompts for Mistral
    ├── maryse.md & maryse_ame.md # Persona definition (edit these, copy to .ts)
    ├── horoscope-file-cache.ts  # Load/save horoscopes from disk (dev only)
    ├── safety-filter.ts         # Content safety checks
    ├── tts-prompt.ts            # TTS-specific prompts
    ├── flore-data.ts            # Guadeloupe flora (generated)
    ├── faune-data.ts            # Fauna (generated)
    ├── lieux-data.ts            # Sacred locations (generated)
    ├── kreyol-data.ts           # Creole resistance symbols (generated)
    ├── histoire-data.ts         # Historical resonance (generated)
    ├── vaudou-data.ts           # Vodou loas, rituals, animals (large reference)
    ├── vaudou-mappings.ts       # Zodiac ↔ Vodou mappings
    └── parse-*.ts               # Scripts to parse markdown refs → .ts files

components/
├── HoroscopeCard.tsx            # Horoscope display card
├── HoroscopeSignPage.tsx        # Full sign page layout
├── AudioPlayer.tsx              # TTS player with visualizer
├── HoroscopesPreview.tsx        # Grid of all 12 signs (preview)
├── InteractiveHoroscope.tsx     # Sign selector + horoscope display
├── SignSelector.tsx             # 12-sign carousel UI
├── NewsletterSubscribeForm.tsx  # Email signup form
├── EnergyBanner.tsx             # Daily energy/ambiance display
├── Articles.tsx                 # Article grid
├── ShareButtons.tsx             # Social share (WhatsApp, Twitter, etc.)
├── ContactForm.tsx              # Contact form handler
├── Footer.tsx
├── Hero.tsx
└── [others]

contexts/
├── AudioPlayerContext.tsx       # Global audio player state
└── EditionContext.tsx           # Current edition (nuit/matin/midi/soir)

scripts/
├── generate-horoscopes.ts       # Main horoscope generation (GitHub Actions)
├── generate-ambiances.ts        # Ambiance scores
├── generate-presage-du-jour.ts  # Daily sign (flora/fauna)
├── generate-tts.ts              # Pre-generate TTS audio
├── generate-daily-newsletter.ts # Generate & send newsletter
├── quality-report.ts            # Audit recent horoscopes
└── [others - analysis, migrations, testing]

.github/workflows/
├── generate-horoscopes.yml      # Daily 3:45 UTC (horoscopes)
├── generate-ambiances.yml       # Daily 4:00 UTC
├── generate-presage-du-jour.yml # Daily 4:15 UTC
├── generate-newsletter.yml      # Daily 4:30 UTC (emails)
├── generate-tts.yml             # Pre-generate audio
├── regenerate-articles.yml      # Monthly (1st at 4 UTC)
└── [quality checks]

netlify/
└── functions/generate-horoscopes.mts  # Serverless function (alternative entry)

public/data/
├── horoscopes/YYYY-MM-DD.json   # Pre-generated horoscopes (cache)
├── ambiance/                    # Ambiance data
├── signe-du-jour/              # Daily sign data
└── [static assets]
```

### Key Architectural Decisions

#### 1. **Edition System (Time of Day)**
Four editions per day, relative to Guadeloupe timezone (UTC-4, no DST):
- **nuit** (0–6h): Dreams, ancestors, spiritual guidance
- **matin** (6–12h): Intention, awakening, action starts
- **midi** (12–18h): Energy, work, peak activity
- **soir** (18–0h): Reflection, rest, closure

Functions in `lib/edition.ts` handle timezone conversion and edition detection.

#### 2. **Maryse CondAI Persona**
The AI writes as Maryse Condé (Guadeloupean author persona). Prompts stored in:
- `lib/private/maryse.md` — Identity (style, voice, symbols, mission)
- `lib/private/maryse_ame.md` — Soul (memory, spirituality, values, language)

These **markdown files are authoritative**. After editing them, copy the content to the TypeScript constants in `lib/private/maryse-prompt.ts`.

Mistral API calls use `MARYSE_SYSTEM` + `buildHoroscopeUserPrompt()` to maintain consistent persona.

#### 3. **Cultural Data (Flora/Fauna/Locations)**
Each zodiac sign has:
- **Creole animal & name** (e.g., Aries = Gwo Zandoli/Iguana)
- **Plant & tree** (e.g., Flamboyant)
- **Sacred location** (e.g., Pointe des Châteaux)
- **Spiritual/historical resonance**
- **Vodou loa correspondence** (spirit guide)

Data lives in generated TypeScript modules (`flore-data.ts`, `faune-data.ts`, etc.) sourced from markdown references. See `scripts/parse-*.ts` for generation logic.

#### 4. **Horoscope Generation Pipeline**
1. **Source**: FreeHoroscopeAPI (English, generic)
2. **Transform**: Mistral Large API + Maryse persona
3. **Enrich**: Add weather, cultural elements, Vodou context, ambiance scores
4. **Cache**: Store in Netlify Blobs (24h TTL) + backup to `public/data/horoscopes/` (static file)
5. **Deliver**: API endpoints serve from cache, then static files, then on-demand generation

Retry logic with exponential backoff for Mistral API failures.

#### 5. **Newsletter System**
- **Generator**: `lib/newsletter-generator.ts` — builds HTML from horoscope data + Brevo template variables
- **Storage**: Supabase (`newsletters` table) + Netlify Blobs
- **Delivery**: Brevo API (SendinBlue) — daily at 4:30 UTC
- **Unsubscribe**: Tracked in Supabase, reflected in Brevo lists
- **Preview**: `npm run test-newsletter-templates` validates HTML before sending

#### 6. **CI/CD with GitHub Actions**
Scheduled workflows generate data 24/7:
- **3:45 UTC** (23:45 Guadeloupe): Horoscopes (all editions)
- **4:00 UTC** (00:00 Guadeloupe): Ambiance/energy scores
- **4:15 UTC** (00:15 Guadeloupe): Daily sign (flore/faune)
- **4:30 UTC** (00:30 Guadeloupe): Newsletter generation & send
- **Monthly (1st, 4 UTC)**: Article regeneration

Workflow logs uploaded to artifacts; quality reports in GitHub Actions.

#### 7. **Safety & Filtering**
- `lib/private/safety-filter.ts` — removes explicit content, misspellings
- `lib/private/safety-guards.ts` — validation, prompt injection detection
- Applied to horoscopes before caching; fallback to generic text if generation fails

### Data Flow: Request → Response

**Example: GET /api/horoscope/belier?edition=matin**

1. Middleware validates sign + edition
2. Check Netlify Blobs cache (`horoscope:belier:matin:YYYY-MM-DD`)
3. If miss → check static file `public/data/horoscopes/YYYY-MM-DD.json`
4. If miss → generate on-demand:
   - Fetch raw horoscope from FreeHoroscopeAPI
   - Call Mistral with Maryse prompt + cultural context
   - Add weather, Vodou context, ambiance scores
   - Apply safety filters
   - Store in cache
5. Return `HoroscopeResponse` (JSON)

**Newsletter Flow: Daily 4:30 UTC**

1. GitHub Actions triggers `generate-daily-newsletter.ts`
2. Fetch today's horoscopes for all 12 signs
3. Fetch subscriber list from Brevo
4. For each subscriber:
   - Detect their sign (from profile)
   - Generate personalized HTML email via `newsletter-generator.ts`
   - Send via Brevo API
5. Log to Supabase (`newsletters` table)
6. Store backup in Netlify Blobs

## Important Files & Patterns

### Environment Variables (Required)
- `MISTRAL_API_KEY` — Mistral AI (horoscopes + TTS)
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — PostgreSQL backend
- `BREVO_API_KEY`, `BREVO_LIST_ID` — Email delivery
- `EMAIL_FROM` — Sender email address
- Optional: `MISTRAL_API_KEY_BOTIRAN` (fallback key)

### Key Type Definitions
- `HoroscopeResponse` — Complete horoscope object (lib/horoscope-data.ts)
- `Sign` — Zodiac sign metadata (lib/signs-data.ts)
- `Edition` — Union type: 'nuit' | 'matin' | 'midi' | 'soir' (lib/private/maryse-prompt.ts)
- `VaudouContext` — Spirit guide + ritual data (lib/horoscope-data.ts)

### Naming Conventions
- Files: kebab-case (e.g., `horoscope-data.ts`)
- Components: PascalCase (e.g., `HoroscopeCard.tsx`)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE (e.g., `MARYSE_SYSTEM`)
- French terms kept in Creole: `loa`, `vaudou`, `quimbois`, `presage`, etc.

### Common Patterns

**Fetching horoscopes in components:**
```typescript
const response = await fetch(`/api/horoscope/${sign}?edition=${edition}`);
const data: HoroscopeResponse = await response.json();
```

**Detecting current edition (client-side):**
```typescript
import { detectLocalEditionWithNight } from '@/lib/edition';
const edition = detectLocalEditionWithNight(); // 'nuit' | 'matin' | 'midi' | 'soir'
```

**Accessing sign data:**
```typescript
import { signs } from '@/lib/signs-data';
const belierSign = signs.find(s => s.id === 'belier');
// Access: belierSign.nomKreyol, belierSign.plante, belierSign.spirituel, etc.
```

**Calling Mistral API directly:**
```typescript
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const response = await fetch(MISTRAL_URL, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
  body: JSON.stringify({ model: 'mistral-large', messages: [...] }),
});
```

## Testing & Quality

- **No automated tests** currently configured (no jest/vitest setup)
- **Manual testing**: Use `npm run test-newsletter-generator`, `npm run test-brevo-connection`, etc.
- **Quality reports**: `npm run quality-report` generates an audit of horoscope quality
- **Dry-runs**: Most scripts support `--verbose` or `--force` flags for testing

## Deployment

Hosted on **Netlify** with automatic deployments from the `vaudou` branch (main development branch; production is stable).

- Build command: `next build`
- Publish directory: `.next`
- Node version: 20
- Functions: `.next` (Next.js API routes via serverless)
- Cache headers configured per `netlify.toml`

Pre-generated horoscopes static files are **committed to repo** for fast initial load.

## Debugging Tips

1. **Horoscope generation failing**: Check `npm run quality-report` for Mistral errors; retry with `--force` flag
2. **Missing cultural data**: Run `npm run data:parse` to regenerate TypeScript modules
3. **Newsletter not sending**: Test `npm run test-brevo-connection` + check Brevo API key + verify subscriber list
4. **TTS audio issues**: Clear cache with `npm run clear-tts-cache`, then regenerate
5. **Timezone bugs**: Always use `todayGuadeloupe()`, `detectEditionWithNight()` (not local time)
6. **Persona drift**: Edit `maryse.md` + `maryse_ame.md`, copy to `maryse-prompt.ts`, regenerate horoscopes

## File Organization Notes

- **Private data** (`lib/private/`) is gitignored except for reference files (`.md`) and prompt configs
- **Generated static** (`public/data/horoscopes/`) is committed for performance
- **Logs** (`logs/`, `lib/private/logs/`) are ephemeral; rotated daily
- **Email storage** (`private_data/newsletters/`) is local; Supabase is source of truth
- **Artifacts** (temp dirs) created during CI/CD, not committed

---

Last updated: 2026-06-09
