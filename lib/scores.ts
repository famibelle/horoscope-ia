import type { WeatherData } from '@/app/api/weather/route';

export interface Scores {
  amour: number;
  travail: number;
  bienetre: number;
  vieSociale: number;
  finances: number;
}

// Ordre des signes dans le zodiaque (index 0–11)
const SIGN_ORDER: Record<string, number> = {
  belier: 0, taureau: 1, gemeaux: 2, cancer: 3,
  lion: 4, vierge: 5, balance: 6, scorpion: 7,
  sagittaire: 8, capricorne: 9, verseau: 10, poissons: 11,
};

// Périodes synodiques en jours — chaque domaine est gouverné par une planète
const CYCLES = {
  amour:      584,   // Vénus
  travail:    116,   // Mercure
  bienetre:    29.53, // Lune
  vieSociale: 398,   // Jupiter
  finances:   378,   // Saturne
};

// Epoch de référence : nouvelle lune du 06/01/2000
const EPOCH = new Date('2000-01-06').getTime();

function daysSinceEpoch(date: string): number {
  return (new Date(date).getTime() - EPOCH) / 86_400_000;
}

// ── Couche 1 : cycles planétaires ───────────────────────────────────────────

function planetaryBase(signId: string, date: string): Scores {
  const days = daysSinceEpoch(date);
  const signIdx = SIGN_ORDER[signId] ?? 0;

  const score = (cycle: number, domainIdx: number): number => {
    // Chaque signe a une phase décalée selon sa position dans le zodiaque
    // Chaque domaine a un décalage supplémentaire pour éviter que tous les scores bougent en parallèle
    const phase = (signIdx * (2 * Math.PI) / 12) + (domainIdx * (2 * Math.PI) / 5);
    return 62 + 22 * Math.sin((2 * Math.PI * days) / cycle + phase);
  };

  return {
    amour:      score(CYCLES.amour,      0),
    travail:    score(CYCLES.travail,    1),
    bienetre:   score(CYCLES.bienetre,   2),
    vieSociale: score(CYCLES.vieSociale, 3),
    finances:   score(CYCLES.finances,   4),
  };
}

// ── Couche 2 : météo Pointe-à-Pitre ─────────────────────────────────────────

function weatherDelta(w: WeatherData): Scores {
  const d: Scores = { amour: 0, travail: 0, bienetre: 0, vieSociale: 0, finances: 0 };

  // Pluie
  if (w.rain > 20) {
    d.bienetre -= 8; d.vieSociale -= 10; d.finances -= 5; d.travail -= 4;
  } else if (w.rain > 5) {
    d.bienetre -= 4; d.vieSociale -= 5;
  } else if (w.rain === 0 && w.code <= 2) {
    // Beau temps tropical
    d.vieSociale += 6; d.amour += 4; d.bienetre += 3;
  }

  // Chaleur : au-dessus de 33°C c'est éprouvant
  if (w.tmax > 33) {
    d.travail -= 7; d.bienetre -= 5;
  } else if (w.tmax >= 28 && w.tmax <= 32) {
    // Chaleur idéale caribéenne
    d.amour += 4; d.bienetre += 3;
  }

  // Vent : alizé frais vs vent fort
  if (w.wind > 45) {
    d.bienetre -= 7; d.vieSociale -= 8; d.amour -= 5;
  } else if (w.wind >= 15 && w.wind <= 35) {
    // Alizé frais — signature de la Guadeloupe
    d.bienetre += 5;
  }

  // Orage
  if (w.code >= 95) {
    d.finances -= 10; d.travail -= 8; d.vieSociale -= 12; d.amour -= 6;
  }

  return d;
}

// ── Couche 3 : calendrier guadeloupéen ──────────────────────────────────────

function culturalDelta(date: string): Scores {
  const d: Scores = { amour: 0, travail: 0, bienetre: 0, vieSociale: 0, finances: 0 };
  const [year, month, day] = date.split('-').map(Number);

  // Carême (déc–juin) : temps sec, clarté, productivité
  if (month <= 6 || month === 12) {
    d.travail += 5; d.finances += 4;
  }

  // Hivernage (juil–nov) : pluies, repli, intuition
  if (month >= 7 && month <= 11) {
    d.bienetre += 5; d.amour += 3; d.travail -= 3; d.finances -= 3;
  }

  // Saison cyclonique (juin–nov) : instabilité générale
  if (month >= 6 && month <= 11) {
    d.finances -= 4;
    // Pic cyclonique (sept–oct)
    if (month === 9 || month === 10) {
      d.finances -= 5; d.vieSociale -= 8;
    }
  }

  // Carnaval guadeloupéen (15 janv → mercredi des cendres, ~15 mars)
  if ((month === 1 && day >= 15) || month === 2 || (month === 3 && day <= 15)) {
    d.vieSociale += 12; d.amour += 8; d.bienetre += 5;
  }

  // Fête des Cuisinières (2e dimanche d'août)
  if (month === 8) {
    const firstDay = new Date(year, 7, 1).getDay(); // 0=dim
    const secondSunday = 1 + (firstDay === 0 ? 7 : 7 - firstDay) + 7;
    if (Math.abs(day - secondSunday) <= 1) {
      d.bienetre += 15; d.vieSociale += 12; d.amour += 6;
    }
  }

  // Commémoration abolition esclavage (27 mai)
  if (month === 5 && day === 27) {
    d.bienetre += 8; d.vieSociale += 6;
  }

  // Zénith solaire au-dessus de la Guadeloupe (~17 mai et ~26 juillet)
  // Unique aux zones tropicales — énergie cosmique maximale
  if ((month === 5 && day >= 15 && day <= 19) || (month === 7 && day >= 24 && day <= 28)) {
    d.amour += 7; d.bienetre += 7; d.vieSociale += 6;
  }

  // Toussaint créole (1er nov) : mémoire des ancêtres
  if (month === 11 && day === 1) {
    d.bienetre += 6;
    d.vieSociale -= 5; // recueillement
  }

  return d;
}

// ── Export principal ─────────────────────────────────────────────────────────

function clamp(n: number): number {
  return Math.max(30, Math.min(95, Math.round(n)));
}

function add(a: Scores, b: Scores): Scores {
  return {
    amour:      a.amour      + b.amour,
    travail:    a.travail    + b.travail,
    bienetre:   a.bienetre   + b.bienetre,
    vieSociale: a.vieSociale + b.vieSociale,
    finances:   a.finances   + b.finances,
  };
}

export function computeScores(signId: string, date: string, weather: WeatherData): Scores {
  const base     = planetaryBase(signId, date);
  const weather_ = weatherDelta(weather);
  const cultural = culturalDelta(date);
  const raw      = add(add(base, weather_), cultural);

  return {
    amour:      clamp(raw.amour),
    travail:    clamp(raw.travail),
    bienetre:   clamp(raw.bienetre),
    vieSociale: clamp(raw.vieSociale),
    finances:   clamp(raw.finances),
  };
}
