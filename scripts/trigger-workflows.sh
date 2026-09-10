#!/bin/bash

# Script pour déclencher manuellement les workflows de génération
# à exécuter après avoir corrigé les horaires des workflows

REPO="famibelle/horoscope-ia"
BRANCH="vaudou"

echo "Déclenchement manuel des workflows de génération..."
echo ""

# 1. Génération des Horoscopes
echo "1. Déclenchement: Génération Horoscopes (Sécurisée)"
gh workflow run "🪐 Génération Horoscopes (Sécurisée)" --ref $BRANCH
echo ""

# Attendre un peu
sleep 5

# 2. Génération du Présage du Jour
echo "2. Déclenchement: Génération Présage du Jour (Sécurisée)"
gh workflow run "✨ Génération Présage du Jour (Sécurisée)" --ref $BRANCH
echo ""

# Attendre un peu
sleep 5

# 3. Génération des Ambiances
echo "3. Déclenchement: Génération Ambiances (Sécurisée)"
gh workflow run "✨ Génération Ambiances (Sécurisée)" --ref $BRANCH
echo ""

echo "✅ Tous les workflows déclenchés manuellement."
echo "Les horoscopes pour aujourd'hui seront générés dans quelques minutes."
