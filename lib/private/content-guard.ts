import * as fs from 'fs';
import * as path from 'path';
import { logMistralUsage, usageFromMistralResponse } from '@/lib/mistral-usage';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

const TEXT_FIELDS = ['ouverture', 'amour', 'travail', 'argent', 'amitie', 'prediction', 'conseil'] as const;

interface LexiqueEntry {
  terme: string;
  sensLegitime: string;
  doublesSens: string;
  contextesRisque: string[];
  exempleProblematique: string;
  reformulation: string;
}

export interface GuardResult {
  modified: boolean;
  fields: Record<string, string>;
  issues: unknown[];
}

function parseLexique(): LexiqueEntry[] {
  const filePath = path.join(__dirname, 'content-guard-lexique.md');
  const content = fs.readFileSync(filePath, 'utf-8');

  const entries: LexiqueEntry[] = [];
  const sections = content.split(/^## /m).slice(1);

  for (const section of sections) {
    const lines = section.split('\n');
    const terme = lines[0].trim();
    if (!terme) continue;

    const get = (field: string): string => {
      const re = new RegExp(`\\*\\*${field}\\*\\*\\s*:\\s*(.+)`, 'i');
      const m = section.match(re);
      return m ? m[1].trim() : '';
    };

    const contextesStr = get('Contextes à risque');
    const contextesRisque = contextesStr
      ? contextesStr.split(/[,;]/).map(s => s.replace(/"/g, '').trim()).filter(Boolean)
      : [];

    entries.push({
      terme,
      sensLegitime: get('Sens légitime'),
      doublesSens: get('Double sens'),
      contextesRisque,
      exempleProblematique: get('Exemple problématique'),
      reformulation: get('Reformulation'),
    });
  }

  return entries;
}

function buildSystemPrompt(entries: LexiqueEntry[]): string {
  const lexique = entries
    .map(e => [
      `### ${e.terme}`,
      `- Sens légitime : ${e.sensLegitime}`,
      `- Double sens à éviter : ${e.doublesSens}`,
      `- Reformulation attendue : ${e.reformulation}`,
      e.exempleProblematique ? `- Exemple problématique : "${e.exempleProblematique}"` : '',
    ].filter(Boolean).join('\n'))
    .join('\n\n');

  return `Tu es un relecteur expert en culture créole guadeloupéenne. Tu analyses les horoscopes de Maryse CondAI pour détecter et corriger les tournures involontairement suggestives ou inappropriées.

## Termes sensibles à surveiller

${lexique}

## Consignes

- Lis chaque champ du JSON fourni et détecte les phrases qui activent involontairement un double sens autour des termes listés.
- Si une phrase est problématique, récris-la en conservant le sens culturel légitime du terme mais en éliminant la connotation indésirable.
- Ne modifie QUE les phrases problématiques. Laisse tout le reste intact (style, créolismes, poésie de Maryse CondAI).
- Conserve le vouvoiement/tutoiement, le rythme, et la richesse de la langue.
- Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "modified": true ou false,
  "fields": { /* les champs corrigés ou identiques */ },
  "issues": [ /* description de chaque problème trouvé et corrigé */ ]
}`;
}

export async function applyContentGuard(
  parsed: Record<string, unknown>,
  apiKey: string,
): Promise<GuardResult> {
  const entries = parseLexique();

  // Extraire uniquement les champs texte
  const fields: Record<string, string> = {};
  for (const f of TEXT_FIELDS) {
    const val = parsed[f];
    if (typeof val === 'string' && val.length > 0) fields[f] = val;
  }

  if (Object.keys(fields).length === 0) {
    return { modified: false, fields, issues: [] };
  }

  // Optimisation : appel Mistral uniquement si un terme sensible est présent
  const combined = Object.values(fields).join(' ').toLowerCase();
  const hasSensitiveTerm = entries.some(e =>
    combined.includes(e.terme.toLowerCase())
  );

  if (!hasSensitiveTerm) {
    return { modified: false, fields, issues: [] };
  }

  const systemPrompt = buildSystemPrompt(entries);

  let res: Response;
  try {
    res = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(fields, null, 2) },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (err) {
    console.warn('[content-guard] Erreur réseau — guard ignoré', err);
    return { modified: false, fields, issues: [] };
  }

  if (!res.ok) {
    console.warn(`[content-guard] Mistral ${res.status} — guard ignoré`);
    logMistralUsage({ source: 'content-guard', model: 'mistral-small-latest', success: false, httpStatus: res.status });
    return { modified: false, fields, issues: [] };
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: unknown };
  logMistralUsage({
    source: 'content-guard',
    model: 'mistral-small-latest',
    success: true,
    httpStatus: res.status,
    ...usageFromMistralResponse(data),
  });
  const raw = data.choices[0]?.message?.content ?? '{}';

  try {
    const result = JSON.parse(raw) as GuardResult;
    return {
      modified: result.modified ?? false,
      fields: result.fields ?? fields,
      issues: result.issues ?? [],
    };
  } catch {
    console.warn('[content-guard] Erreur parsing JSON — guard ignoré');
    return { modified: false, fields, issues: [] };
  }
}
