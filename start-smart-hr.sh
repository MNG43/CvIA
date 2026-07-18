#!/bin/bash
set -e

echo "🚀 Démarrage de Smart HR Sourcing (Docker Compose)..."

docker compose up -d --build

echo ""
echo "✅ Services en cours de démarrage"
echo ""
echo "⏳ Premier démarrage : la compilation Maven des microservices peut prendre plusieurs minutes."
echo "   Suivez la progression avec : docker compose logs -f"
echo ""
echo "🌐 Interfaces :"
echo "   Frontend  : http://localhost:3000"
echo "   Gateway   : http://localhost:8080"
echo "   Eureka    : http://localhost:8761"
echo ""
echo "🤖 Pour activer l'IA, téléchargez les modèles Ollama :"
echo "   docker exec -it ollama ollama pull llama3.2"
echo "   docker exec -it ollama ollama pull nomic-embed-text"
echo ""
echo "👤 Comptes de démonstration :"
echo "   admin / admin123       (Administrateur)"
echo "   recruteur / recruteur123 (Recruteur)"
echo "   candidat / candidat123   (Candidat)"
