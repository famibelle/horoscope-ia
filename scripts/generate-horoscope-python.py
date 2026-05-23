#!/usr/bin/env python3
"""
Script Python pour générer un horoscope pour un signe donné.
Lit les données depuis public/data/horoscopes/YYYY-MM-DD.json

Usage:
    python scripts/generate-horoscope-python.py belier
    python scripts/generate-horoscope-python.py taureau --edition soir
    python scripts/generate-horoscope-python.py cancer --date 2026-05-23
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Dossier où sont stockés les horoscopes
HOROSCOPE_DIR = Path(__file__).parent.parent / "public" / "data" / "horoscopes"

# Signes valides
VALID_SIGNS = [
    "belier", "taureau", "gemeaux", "cancer", "lion", "vierge",
    "balance", "scorpion", "sagittaire", "capricorne", "verseau", "poissons"
]

# Éditions valides
VALID_EDITIONS = ["matin", "midi", "soir", "nuit"]


def get_today_date():
    """Retourne la date du jour au format YYYY-MM-DD."""
    return datetime.now().strftime("%Y-%m-%d")


def get_latest_horoscope_file():
    """Trouve le fichier d'horoscope le plus récent."""
    if not HOROSCOPE_DIR.exists():
        return None
    
    json_files = list(HOROSCOPE_DIR.glob("*.json"))
    if not json_files:
        return None
    
    return max(json_files, key=lambda f: f.stat().st_mtime)


def load_horoscope_data(date_str):
    """Charge les données d'horoscope pour une date donnée."""
    file_path = HOROSCOPE_DIR / f"{date_str}.json"
    
    if not file_path.exists():
        # Essayer avec le fichier le plus récent
        latest = get_latest_horoscope_file()
        if latest:
            file_path = latest
        else:
            print(f"❌ Aucun fichier d'horoscope trouvé dans {HOROSCOPE_DIR}")
            sys.exit(1)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_current_edition():
    """Détermine l'édition actuelle basée sur l'heure."""
    hour = datetime.now().hour
    
    if 6 <= hour < 12:
        return "matin"
    elif 12 <= hour < 18:
        return "midi"
    elif 18 <= hour < 22:
        return "soir"
    else:
        return "nuit"


def format_horoscope(horoscope_data, sign, edition=None):
    """Formate l'horoscope pour affichage."""
    if edition is None:
        edition = get_current_edition()
    
    # Clé de recherche : date|sign|edition
    today = get_today_date()
    
    # Essayez avec la date du jour
    key = f"{today}|{sign}|{edition}"
    data = horoscope_data.get(key)
    
    # Si non trouvé, essayer sans la date (format ancien)
    if not data:
        # Essayer toutes les éditions pour ce signe aujourd'hui
        for ed in VALID_EDITIONS:
            key = f"{today}|{sign}|{ed}"
            data = horoscope_data.get(key)
            if data:
                edition = ed
                break
    
    # Si toujours non trouvé, essayer avec le dernier fichier
    if not data:
        latest_file = get_latest_horoscope_file()
        if latest_file:
            date_from_filename = latest_file.stem
            for ed in VALID_EDITIONS:
                key = f"{date_from_filename}|{sign}|{ed}"
                data = horoscope_data.get(key)
                if data:
                    edition = ed
                    break
    
    if not data:
        print(f"❌ Aucun horoscope trouvé pour {sign} (édition: {edition})")
        print(f"   Fichiers disponibles: {list(HOROSCOPE_DIR.glob('*.json'))}")
        sys.exit(1)
    
    # Formatage
    print(f"\n{'='*60}")
    print(f"  🌟 HOROSCOPE DU JOUR POUR {sign.upper()} 🌟")
    print(f"  Édition: {edition.capitalize()}")
    print(f"  Date: {today}")
    print(f"{'='*60}\n")
    
    # Afficher chaque section
    sections = [
        ("Parole des ancêtres", "ouverture"),
        ("Amour", "amour"),
        ("Travail", "travail"),
        ("Argent", "argent"),
        ("Lyannaj (Amitié)", "amitie"),
        ("Présage ancestral", "prediction"),
        ("Conseil de la plante", "conseil"),
    ]
    
    for title, key in sections:
        if key in data and data[key]:
            print(f"  {title}:")
            print(f"    {data[key]}")
            print()
    
    # Afficher les métadonnées culturelles si présentes
    if "culturalData" in data and data["culturalData"]:
        cd = data["culturalData"]
        print(f"  🌿 Données culturelles:")
        if cd.get("faune"):
            print(f"    - Totem: {cd['faune'].get('nom_creole', 'N/A')}")
        if cd.get("flore"):
            print(f"    - Plante: {cd['flore'].get('nom_creole', 'N/A')}")
        if cd.get("lieu"):
            print(f"    - Lieu: {cd.get('lieu', 'N/A')}")
        print()
    
    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Génère un horoscope pour un signe donné"
    )
    parser.add_argument(
        "sign",
        type=str,
        nargs='?',  # Rend l'argument optionnel
        help="Signe du zodiaque (belier, taureau, gemeaux, etc.)"
    )
    parser.add_argument(
        "--edition", "-e",
        type=str,
        choices=VALID_EDITIONS,
        help="Édition (matin, midi, soir, nuit). Par défaut: détecté automatiquement"
    )
    parser.add_argument(
        "--date", "-d",
        type=str,
        help="Date au format YYYY-MM-DD. Par défaut: aujourd'hui"
    )
    parser.add_argument(
        "--all-editions", "-a",
        action="store_true",
        help="Afficher toutes les éditions pour ce signe"
    )
    parser.add_argument(
        "--list-signs", "-l",
        action="store_true",
        help="Lister tous les signes valides"
    )
    
    args = parser.parse_args()
    
    # Lister les signes
    if args.list_signs:
        print("Signes valides:")
        for sign in VALID_SIGNS:
            print(f"  - {sign}")
        sys.exit(0)
    
    # Si aucun signe n'est fourni et pas d'option --list-signs
    if not args.sign:
        parser.print_help()
        sys.exit(1)
    
    # Valider le signe
    sign = args.sign.lower()
    if sign not in VALID_SIGNS:
        print(f"❌ Signe invalide: {sign}")
        print(f"Signes valides: {', '.join(VALID_SIGNS)}")
        sys.exit(1)
    
    # Charger les données
    date_str = args.date if args.date else get_today_date()
    horoscope_data = load_horoscope_data(date_str)
    
    if args.all_editions:
        # Afficher toutes les éditions
        print(f"\n📅 Toutes les éditions pour {sign.upper()} - {date_str}")
        print("=" * 60)
        for edition in VALID_EDITIONS:
            print(f"\n🕒 ÉDITION: {edition.upper()}")
            format_horoscope(horoscope_data, sign, edition)
    else:
        # Afficher une seule édition
        format_horoscope(horoscope_data, sign, args.edition)


if __name__ == "__main__":
    main()
