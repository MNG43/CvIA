# Guide de Lancement Docker - Smart HR Sourcing

## Prérequis

- Docker Desktop installé et en cours d'exécution
- Ollama installé localement (optionnel, pour l'IA réelle)

## Lancement rapide

### 1. Démarrer uniquement l'infrastructure de test (AI Service + Frontend)

```bash
cd d:\projet\smart-hr-sourcing
docker-compose up -d kafka postgres-vector ai-service frontend-test
```

### 2. Accéder à l'interface de test

Ouvrir votre navigateur sur : **http://localhost:8080**

## Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend Test | 8080 | Interface web de test |
| AI Service | 8084 | Microservice d'analyse IA |
| Kafka | 9092 | Bus d'événements |
| PostgreSQL vector_db | 5436 | Base de données vectorielle |

## Arrêt des services

```bash
docker-compose down
```

Pour supprimer également les volumes :
```bash
docker-compose down -v
```

## Logs des services

Voir les logs du AI Service :
```bash
docker logs -f ai-service
```

Voir les logs de tous les services :
```bash
docker-compose logs -f
```

## API Documentation

Swagger UI du AI Service : http://localhost:8084/swagger-ui.html

## Note sur Ollama

Pour utiliser l'IA réelle (embeddings et génération de résumé), vous devez avoir Ollama installé localement et lancer un modèle :

```bash
# Installer Ollama (si ce n'est pas déjà fait)
# Télécharger sur : https://ollama.ai/

# Lancer le modèle
ollama run llama3.2
```

Le AI Service est configuré pour se connecter à `http://host.docker.internal:11434/v1` qui permet au conteneur Docker d'accéder à Ollama sur votre machine hôte.
