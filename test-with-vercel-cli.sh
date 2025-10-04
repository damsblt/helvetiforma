#!/bin/bash

# Script de test avec Vercel CLI
echo "🧪 Test du flux d'inscription avec Vercel CLI..."
echo ""

# Configuration
APP_URL="https://helvetiforma.vercel.app"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@helvetiforma-test.com"
TEST_PASSWORD="TestPassword123!"

echo "📧 Email de test: $TEST_EMAIL"
echo "🔑 Mot de passe: $TEST_PASSWORD"
echo ""

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "   Installez-le avec: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI détecté"
echo ""

# Test 1: Vérifier que l'application est déployée
echo "1️⃣ Vérification du déploiement..."
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL" | grep -q "200"; then
    echo "✅ Application accessible sur $APP_URL"
else
    echo "❌ Application non accessible sur $APP_URL"
    exit 1
fi
echo ""

# Test 2: Vérifier la page d'inscription
echo "2️⃣ Vérification de la page d'inscription..."
REGISTER_URL="$APP_URL/register"
if curl -s -o /dev/null -w "%{http_code}" "$REGISTER_URL" | grep -q "200"; then
    echo "✅ Page d'inscription accessible: $REGISTER_URL"
else
    echo "❌ Page d'inscription non accessible: $REGISTER_URL"
    exit 1
fi
echo ""

# Test 3: Vérifier les logs Vercel
echo "3️⃣ Vérification des logs Vercel..."
echo "   Récupération des logs récents..."
vercel logs --follow=false --limit=10
echo ""

# Test 4: Test de l'API d'inscription (si elle existe)
echo "4️⃣ Test de l'API d'inscription..."
API_URL="$APP_URL/api/auth/register"
echo "   Tentative de test API: $API_URL"

# Note: Cette API n'existe peut-être pas, c'est normal
if curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -w "%{http_code}" | grep -q "200\|201\|400"; then
    echo "✅ API d'inscription répond"
else
    echo "⚠️  API d'inscription non disponible (normal si inscription côté client)"
fi
echo ""

# Test 5: Instructions pour le test manuel
echo "5️⃣ Instructions pour le test manuel:"
echo "   Ouvrez votre navigateur et allez sur: $REGISTER_URL"
echo "   Inscrivez-vous avec:"
echo "   - Email: $TEST_EMAIL"
echo "   - Mot de passe: $TEST_PASSWORD"
echo "   - Prénom: Test"
echo "   - Nom: User"
echo ""

echo "6️⃣ Vérification dans Supabase:"
echo "   Allez dans Supabase Dashboard → Table Editor → profiles"
echo "   Cherchez l'email: $TEST_EMAIL"
echo "   Le profil devrait apparaître automatiquement"
echo ""

echo "✅ Test Vercel CLI terminé!"
echo "   Consultez les logs avec: vercel logs --follow"
