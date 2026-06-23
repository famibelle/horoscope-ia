import { NextResponse } from 'next/server';

export const revalidate = 3600; // revalidation toutes les heures

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({}, { status: 500 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/dictionnaire?select=nom_creole,nom_francais,nom_scientifique,type,sacre_symbolique,dimension_culturelle`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) {
    return NextResponse.json({}, { status: 502 });
  }

  const rows: any[] = await res.json();

  // Construit une map nomCreole → définition légère pour les tooltips
  // Chaque segment du nomCreole composé (ex. "Fwou-fwou / Kolibri") est indexé séparément
  const dict: Record<string, {
    definition: string;
    nomFrancais?: string;
    nomScientifique?: string;
    type: string;
    sacreSymbolique?: string;
  }> = {};

  for (const row of rows) {
    const entry = {
      definition: row.dimension_culturelle
        ? row.dimension_culturelle.split(/[.!?]/)[0].trim() + '.'
        : '',
      nomFrancais: row.nom_francais ?? undefined,
      nomScientifique: row.nom_scientifique ?? undefined,
      type: row.type,
      sacreSymbolique: row.sacre_symbolique ?? undefined,
    };
    dict[row.nom_creole] = entry;
    for (const segment of (row.nom_creole as string).split('/').map((s: string) => s.trim())) {
      if (segment && segment !== row.nom_creole) dict[segment] = entry;
    }
  }

  return NextResponse.json(dict, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
