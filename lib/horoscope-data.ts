export interface DailyHoroscope {
  cosmic: string;
  love: string;
  work: string;
  advice: string;
  music: string;
  color: string;
  colorHex: string;
  luckyNumber: number;
  intensity: number;
}

export const horoscopeData: Record<string, DailyHoroscope> = {
  belier: {
    cosmic:
      "Mars vous propulse vers l'avant avec une énergie débordante. Ce dimanche, votre détermination attire les opportunités les plus lumineuses de votre horizon.",
    love: "Une conversation sincère transforme une relation. Osez exprimer vos sentiments profonds — votre authenticité est votre plus grand charme aujourd'hui.",
    work: 'Votre initiative sera remarquée. Un projet longtemps en attente trouve enfin son élan. Foncez avec confiance, le cosmos vous soutient.',
    advice: 'Ralentissez un instant avant d\'agir. La puissance s\'exprime mieux dans le calme maîtrisé.',
    music: 'Stromae — Alors on danse',
    color: 'Rouge ardent',
    colorHex: '#ef4444',
    luckyNumber: 9,
    intensity: 9,
  },
  taureau: {
    cosmic:
      "Vénus illumine votre sens du beau et votre quête de confort profond. Une période de récolte s'ouvre, portée par votre persévérance sans faille.",
    love: "Votre douceur naturelle crée un espace de confiance rare. Un être proche cherche votre présence rassurante — offrez-la pleinement.",
    work: 'La stabilité que vous avez construite porte ses fruits. Une reconnaissance financière ou professionnelle est dans l\'air du temps cosmique.',
    advice: 'Résistez à la tentation du statu quo. Un léger pas en avant peut tout changer.',
    music: 'Fado — Mariza',
    color: 'Vert émeraude',
    colorHex: '#10b981',
    luckyNumber: 6,
    intensity: 7,
  },
  gemeaux: {
    cosmic:
      "Mercure en danse crée une symphonie de connexions. Vos mots ont aujourd'hui une portée magique — chaque conversation peut devenir une révélation.",
    love: 'La légèreté est votre force. Un échange spontané, presque anodin, pourrait éveiller des sentiments inattendus et délicieux.',
    work: "Votre esprit analytique détecte ce que d'autres manquent. Partagez votre vision — elle sera reçue avec enthousiasme.",
    advice: "Posez le téléphone. La vraie connexion naît dans le silence partagé, pas dans le flux numérique.",
    music: 'Daft Punk — Get Lucky',
    color: 'Or solaire',
    colorHex: '#f59e0b',
    luckyNumber: 3,
    intensity: 8,
  },
  cancer: {
    cosmic:
      "La Lune, votre gardienne éternelle, vous berce d'une tendresse cosmique. Vos émotions sont aujourd'hui des guides précieux — écoutez-les.",
    love: "Un souvenir ressurgit et éclaire votre présent. La nostalgie peut devenir un pont vers quelque chose de plus beau encore.",
    work: "Votre intuition dépasse les analyses froides. Faites confiance à cette certitude intérieure qui vous guide vers les bonnes décisions.",
    advice: "Prenez soin de votre espace sacré. Un foyer harmonieux nourrit votre âme et amplifie votre créativité.",
    music: 'Norah Jones — Come Away with Me',
    color: 'Bleu lunaire',
    colorHex: '#38bdf8',
    luckyNumber: 2,
    intensity: 6,
  },
  lion: {
    cosmic:
      "Votre énergie attire naturellement les bonnes opportunités. Le Soleil, votre étoile maîtresse, illumine chaque aspect de votre journée avec une grâce royale.",
    love: "Une connexion sincère se renforce aujourd'hui. Votre présence lumineuse inspire ceux qui vous entourent — laissez votre cœur rayonner librement.",
    work: "Une initiative personnelle sera remarquée positivement. Votre charisme naturel ouvre des portes que la compétence seule ne suffirait pas à débloquer.",
    advice: "Faites confiance à votre intuition royale. Elle ne vous a jamais trahi et vous guide vers votre plus haute version.",
    music: "Kassav' — Zouk la sé sèl médikaman nou ni",
    color: 'Or royal',
    colorHex: '#f59e0b',
    luckyNumber: 1,
    intensity: 10,
  },
  vierge: {
    cosmic:
      'Mercure affûte votre intelligence déjà remarquable. Votre capacité à voir dans les détails ce que les autres ignorent est un don cosmique exceptionnel.',
    love: "La perfection que vous recherchez existe, mais sous une forme différente de celle imaginée. Ouvrez votre cœur à l'imprévu charmant.",
    work: 'Votre méthode rigoureuse résout ce qui semblait insoluble. Un collègue vous sollicitera pour votre expertise — acceptez avec élégance.',
    advice: 'Accordez-vous la grâce de l\'imperfection. Les plus beaux jardins ont quelques fleurs sauvages.',
    music: 'Bach — Cello Suite No. 1',
    color: 'Vert jade',
    colorHex: '#14b8a6',
    luckyNumber: 5,
    intensity: 7,
  },
  balance: {
    cosmic:
      "Vénus vous enveloppe d'une aura d'harmonie irrésistible. Votre sens de l'équilibre est aujourd'hui un cadeau précieux pour tous ceux qui vous approchent.",
    love: "La beauté d'un moment partagé transcende les mots. Une soirée simple peut devenir un souvenir éternel si vous la vivez pleinement.",
    work: "Votre talent pour la médiation résout une tension latente. Votre diplomatie naturelle crée de la valeur là où régnait la discorde.",
    advice: 'Cessez de peser indéfiniment. Choisissez avec le cœur — votre instinct est plus juste que vous ne le croyez.',
    music: 'Erik Satie — Gymnopédie No. 1',
    color: 'Rose nacré',
    colorHex: '#ec4899',
    luckyNumber: 7,
    intensity: 7,
  },
  scorpion: {
    cosmic:
      "Pluton révèle les vérités cachées que vous seul osez affronter. Votre profondeur est aujourd'hui une force transformatrice — utilisez-la avec sagesse.",
    love: "L'intensité de vos sentiments peut effrayer, mais elle est aussi ce qui crée des liens indestructibles. Osez la vulnérabilité.",
    work: "Votre perspicacité détecte une opportunité que personne d'autre ne voit encore. Agissez discrètement avant que la fenêtre ne se ferme.",
    advice: "Lâchez ce que vous ne pouvez contrôler. La transformation naît toujours dans l'espace de l'abandon consenti.",
    music: 'Nick Cave — Into My Arms',
    color: 'Pourpre mystique',
    colorHex: '#7c3aed',
    luckyNumber: 8,
    intensity: 9,
  },
  sagittaire: {
    cosmic:
      "Jupiter étend votre horizon au-delà de ce que vous osiez imaginer. L'aventure vous appelle et le cosmos a préparé le chemin pour vous.",
    love: "L'amour libre et joyeux est votre manière naturelle d'aimer. Quelqu'un partage aujourd'hui votre vision du monde — cherchez-le.",
    work: "Une opportunité internationale ou créative émerge. Votre vision d'ensemble vous positionne comme leader naturel d'un nouveau projet.",
    advice: "Ancrez-vous un instant. Les grandes aventures ont besoin de fondations solides pour durer.",
    music: 'Cesária Évora — Sodade',
    color: 'Orange cosmique',
    colorHex: '#f97316',
    luckyNumber: 11,
    intensity: 8,
  },
  capricorne: {
    cosmic:
      "Saturne vous rappelle que chaque effort compte, chaque discipline porte ses fruits. Votre montagne est aujourd'hui plus proche du sommet.",
    love: "Vos murs protecteurs sont aussi vos prisons. Permettez à quelqu'un de méritant de les franchir — une surprise douce vous attend.",
    work: "Votre persévérance légendaire est récompensée. Un résultat concret marque l'aboutissement d'une longue période d'efforts silencieux.",
    advice: "Célébrez vos victoires, même petites. La gratitude amplifie ce que vous avez construit.",
    music: 'Miles Davis — Kind of Blue',
    color: 'Argent sidéral',
    colorHex: '#94a3b8',
    luckyNumber: 4,
    intensity: 7,
  },
  verseau: {
    cosmic:
      "Uranus électrise votre génie unique. Vos idées sont aujourd'hui en avance de dix ans sur leur temps — partagez-les sans retenue.",
    love: "L'amour que vous offrez est rare et précieux dans sa forme libre et respectueuse. Quelqu'un apprécie enfin votre manière d'aimer.",
    work: "Une innovation que vous portez seul trouve enfin un écho collectif. Votre vision révolutionnaire sera adoptée plus vite que prévu.",
    advice: "Connectez vos idées à l'humain. Les révolutions les plus durables touchent les cœurs autant que les esprits.",
    music: 'Kraftwerk — Autobahn',
    color: 'Bleu électrique',
    colorHex: '#3b82f6',
    luckyNumber: 22,
    intensity: 8,
  },
  poissons: {
    cosmic:
      "Neptune dissout les frontières entre rêve et réalité. Votre sensibilité est aujourd'hui un portail vers des dimensions que peu peuvent percevoir.",
    love: "L'amour inconditionnel que vous portez en vous cherche une expression concrète. Offrez-le — vous serez surpris de ce qui vous revient.",
    work: "Votre créativité intuitive résout ce que la logique ne peut atteindre. Faites confiance à l'image qui vient, pas seulement aux mots.",
    advice: "Posez des limites avec amour. Prendre soin de vous n'est pas un abandon des autres.",
    music: "Yann Tiersen — Comptine d'un autre été",
    color: 'Violet rêveur',
    colorHex: '#8b5cf6',
    luckyNumber: 12,
    intensity: 8,
  },
};

export const todaySign = 'lion';

export function formatDate(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}
