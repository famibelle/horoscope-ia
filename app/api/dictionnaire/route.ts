import { NextResponse } from 'next/server';

export const revalidate = 3600; // revalidation toutes les heures

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// Termes vaudou/culturels curatés manuellement — opaque pour un lecteur français
// Règle : n'entre ici que ce qui est vraiment non-déductible du contexte
const TERMES_CULTURELS: Record<string, {
  definition: string;
  nomFrancais: string;
  type: string;
  sacreSymbolique?: string;
}> = {
  'lajan':        { nomFrancais: 'Argent', type: 'culture', definition: 'Mot créole guadeloupéen pour l\'argent, mais aussi symbole d\'échange et de flux vital.' },
  'loa':          { nomFrancais: 'Esprit vaudou', type: 'vaudou', definition: 'Divinité du panthéon vaudou, intermédiaire entre les humains et le Grand Maître.', sacreSymbolique: 'Présence invisible qui guide et protège' },
  'Legba':        { nomFrancais: 'Papa Legba', type: 'vaudou', definition: 'Loa des carrefours et des passages, gardien des seuils entre le monde visible et invisible.', sacreSymbolique: 'Ouvrir les chemins' },
  'Kafou':        { nomFrancais: 'Maître Carrefour', type: 'vaudou', definition: 'Aspect nocturne et imprévisible de Legba, maître des croisements et du destin.', sacreSymbolique: 'Carrefour des destins' },
  'Ogoun':        { nomFrancais: 'Ogoun', type: 'vaudou', definition: 'Loa du fer, du feu et du combat — protecteur des travailleurs et des guerriers.', sacreSymbolique: 'Force et justice' },
  'Ezili Freda':  { nomFrancais: 'Erzulie Freda', type: 'vaudou', definition: 'Loa de l\'amour, de la beauté et du désir — coquette, exigeante, jamais pleinement satisfaite.', sacreSymbolique: 'Amour sacré et mélancolie' },
  'Baron Samedi': { nomFrancais: 'Baron Samedi', type: 'vaudou', definition: 'Maître de la mort et de la résurrection, il rit face à l\'inévitable et guérit ce que les médecins abandonnent.', sacreSymbolique: 'Mort et renaissance' },
  'La Sirène':    { nomFrancais: 'La Sirène', type: 'vaudou', definition: 'Loa des eaux profondes et de la musique — elle appelle les élus dans les abysses pour leur révéler des savoirs secrets.', sacreSymbolique: 'Profondeur et révélation' },
  'peristil':     { nomFrancais: 'Péristyle', type: 'vaudou', definition: 'Temple vaudou à ciel ouvert où se déroulent les cérémonies, les danses et les invocations des loas.', sacreSymbolique: 'Lieu de rencontre des deux mondes' },
  'vèvè':         { nomFrancais: 'Vévé', type: 'vaudou', definition: 'Signe sacré tracé sur le sol avec de la farine pour invoquer un loa spécifique lors des cérémonies.', sacreSymbolique: 'Signature du loa' },
  'pwen':         { nomFrancais: 'Pwen (point)', type: 'vaudou', definition: 'Objet chargé d\'une force spirituelle — protection, attaque ou guidance selon sa préparation rituelle.', sacreSymbolique: 'Force concentrée' },
  'lyannaj':      { nomFrancais: 'Lyanaj (lien)', type: 'culture', definition: 'Entraide et solidarité communautaire, principe fondateur de la société créole guadeloupéenne.', sacreSymbolique: 'Tisser les liens qui font tenir debout' },
  'quimbois':     { nomFrancais: 'Quimbois', type: 'culture', definition: 'Pratique magico-religieuse créole mêlant phytothérapie, rituels africains et catholicisme populaire.', sacreSymbolique: 'Savoir caché de la forêt' },
  'soukougnan':   { nomFrancais: 'Soukougnan', type: 'culture', definition: 'Être du folklore antillais qui, la nuit, ôte sa peau et se transforme en boule de feu pour sucer le sang des dormeurs.', sacreSymbolique: 'Frontière entre humain et esprit' },
  'gade zafe':    { nomFrancais: 'Regarder les affaires', type: 'culture', definition: 'Pratique divinatoire créole pour révéler ce qui est caché : causes d\'une maladie, d\'une malchance ou d\'un conflit.', sacreSymbolique: 'Voir ce que l\'œil ordinaire ne voit pas' },
  'mas':          { nomFrancais: 'Masque / Mascarade', type: 'culture', definition: 'Figure du carnaval guadeloupéen — personnage masqué porteur d\'une identité inversée, entre rire et transgression.', sacreSymbolique: 'Renverser l\'ordre pour mieux le restituer' },
  'chanté mas':   { nomFrancais: 'Chant de mascarade', type: 'culture', definition: 'Chant satirique du carnaval créole, mêlant improvisation, critique sociale et possession joyeuse de la rue.', sacreSymbolique: 'Parole libérée' },
  'ka':           { nomFrancais: 'Tambour Ka', type: 'culture', definition: 'Tambour conique au cœur de la musique gwoka — mémoire vivante de la résistance africaine en Guadeloupe.', sacreSymbolique: 'Battement du cœur ancestral' },
};

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

  // Merge : Supabase en priorité, culturels en fallback (ne pas écraser faune/flore existants)
  for (const [terme, entry] of Object.entries(TERMES_CULTURELS)) {
    if (!dict[terme]) dict[terme] = entry;
  }

  return NextResponse.json(dict, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
