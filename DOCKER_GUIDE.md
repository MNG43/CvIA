# Guide de Lancement Docker - Smart HR Sourcing

## Prérequis

- Docker Desktop installé et en cours d'exécution
- Ollama installé localement (optionnel, pour l'IA réelle)

## Lancement complet

### 1. Démarrer tous les microservices et l'infrastructure

```bash
cd d:\projet\smart-hr-sourcing
docker-compose up -d
```

Cette commande lance :
- **Infrastructure** : Kafka, PostgreSQL (auth_db, job_db, candidate_db, vector_db)
- **Microservices** : Discovery Service, Config Service, Gateway Service, Auth Service, Job Service, Candidate Service, AI Service, Notification Service
- **Frontend** : Interface de test CV upload

### 2. Accéder à l'interface de test

Ouvrir votre navigateur sur : **http://localhost:3000**

### 3. Ordre de démarrage respecté

Le docker-compose respecte l'ordre de démarrage du projet :
1. Discovery Service (Eureka) - Port 8761
2. Config Service - Port 8888
3. Auth Service - Port 8081
4. Job Service - Port 8082
5. Candidate Service - Port 8083
6. AI Service - Port 8084
7. Notification Service - Port 8085
8. Gateway Service - Port 8080
9. Frontend Test - Port 3000

## Services disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend Test | 3000 | Interface web de test CV upload |
| Gateway Service | 8080 | API Gateway |
| Auth Service | 8081 | Authentification JWT |
| Job Service | 8082 | Gestion des offres d'emploi |
| Candidate Service | 8083 | Gestion des candidats et CVs |
| AI Service | 8084 | Analyse IA et matching |
| Notification Service | 8085 | Notifications par événements |
| Discovery Service | 8761 | Service Discovery (Eureka) |
| Config Service | 8888 | Configuration centralisée |
| Kafka | 9092 | Bus d'événements |
| PostgreSQL auth_db | 5435 | Base de données Auth |
| PostgreSQL job_db | 5433 | Base de données Job |
| PostgreSQL candidate_db | 5434 | Base de données Candidate |
| PostgreSQL vector_db | 5436 | Base de données vectorielle (PgVector) |

## Lancement partiel (test rapide)

Pour tester uniquement l'upload de CV avec l'IA :

```bash
docker-compose up -d kafka postgres-vector discovery-service config-service ai-service gateway-service frontend-test
```

## Arrêt des services

```bash
docker-compose down
```

Pour supprimer également les volumes :
```bash
docker-compose down -v
```

## Logs des services

Voir les logs d'un service spécifique :
```bash
docker logs -f ai-service
docker logs -f gateway-service
```

Voir les logs de tous les services :
```bash
docker-compose logs -f
```

## API Documentation

Swagger UI disponible pour chaque microservice :
- AI Service : http://localhost:8084/swagger-ui.html
- Auth Service : http://localhost:8081/swagger-ui.html
- Job Service : http://localhost:8082/swagger-ui.html
- Candidate Service : http://localhost:8083/swagger-ui.html

## Note sur Ollama

Pour utiliser l'IA réelle (embeddings et génération de résumé), vous devez avoir Ollama installé localement et lancer un modèle :

```bash
# Installer Ollama (si ce n'est pas déjà fait)
# Télécharger sur : https://ollama.ai/

# Lancer le modèle
ollama run llama3.2
```

Le AI Service est configuré pour se connecter à `http://host.docker.internal:11434` qui permet au conteneur Docker d'accéder à Ollama sur votre machine hôte.

## Test de l'upload de CV

1. Accédez à http://localhost:3000
2. Uploadez un ou deux CVs (PDF)
3. (Optionnel) Ajoutez une description de poste
4. Cliquez sur "Analyser les CVs"
5. Les résultats s'afficheront avec le score, le résumé et les compétences détectées

---

## Test des API avec Postman

### Données de test pré-insérées

Les services contiennent déjà des données de test pour faciliter les tests :

**Auth Service (port 8081):**
- Utilisateur ADMIN : `admin` / `admin123`
- Utilisateur RECRUTEUR : `recruteur` / `recruteur123`

**Job Service (port 8082):**
- Job ID 1 : Développeur Java Full Stack (Paris)
- Job ID 2 : Data Engineer (Lyon)
- Job ID 3 : DevOps Engineer (Remote)

**Candidate Service (port 8083):**
- Candidate ID 1 : Jean Dupont (jean.dupont@email.com) - Java Developer
- Candidate ID 2 : Marie Martin (marie.martin@email.com) - Data Scientist
- Application ID 1 : Jean → Job 1 (status: PRE_SELECTION)
- Application ID 2 : Marie → Job 2 (status: CV_RECUS)

### Exemples de requêtes API

#### Authentification

```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Job Service

```http
# Récupérer toutes les offres
GET http://localhost:8082/api/jobs

# Récupérer une offre spécifique
GET http://localhost:8082/api/jobs/1
```

#### Candidate Service

```http
# Récupérer tous les candidats
GET http://localhost:8083/api/candidates

# Récupérer un candidat spécifique
GET http://localhost:8083/api/candidates/1

# Récupérer les candidatures pour une offre
GET http://localhost:8083/api/candidates/by-job/1

# Mettre à jour le statut d'une candidature
PUT http://localhost:8083/api/candidates/application/1/status?status=ENTRETIEN
```

**Statuts disponibles:**
- `CV_RECUS`
- `PRE_SELECTION`
- `ENTRETIEN`
- `TEST_TECHNIQUE`
- `RECRUTE`

#### Notification Service

Pour voir les notifications Kafka en temps réel :

```bash
docker logs notification-service -f
```

Lorsque vous changez le statut d'une candidature, vous verrez une notification simulée :
```
[SIMULATION] Email au candidat : Votre statut a changé !
> Destinataire: candidat_1@email.com
> Sujet: Mise à jour de votre candidature
> Message: Votre statut est passé à 'PRE_SELECTION'
```

### Test rapide avec PowerShell

```powershell
# Login Admin
Invoke-WebRequest -Uri "http://localhost:8081/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}' -UseBasicParsing

# Récupérer toutes les offres
Invoke-WebRequest -Uri "http://localhost:8082/api/jobs" -Method GET -UseBasicParsing

# Récupérer tous les candidats
Invoke-WebRequest -Uri "http://localhost:8083/api/candidates" -Method GET -UseBasicParsing

# Mettre à jour le statut d'une candidature
Invoke-WebRequest -Uri "http://localhost:8083/api/candidates/application/1/status?status=ENTRETIEN" -Method PUT -UseBasicParsing
```

---

## Vérification de l'état des services

### Vérifier que tous les services sont démarrés

```bash
docker ps
```

Vous devriez voir tous les conteneurs avec le statut "Up".

### Vérifier les logs d'un service spécifique

```bash
docker logs auth-service
docker logs job-service
docker logs candidate-service
docker logs notification-service
```

### Vérifier l'enregistrement dans Eureka

Ouvrir : http://localhost:8761

Vous devriez voir tous les microservices enregistrés (AUTH-SERVICE, JOB-SERVICE, CANDIDATE-SERVICE, etc.)

---

## Dépannage

### Un service ne démarre pas

1. Vérifier les logs du service : `docker logs <nom-du-service>`
2. Vérifier que les dépendances sont démarrées (PostgreSQL, Kafka, Eureka)
3. Redémarrer le service : `docker-compose restart <nom-du-service>`

### Problème de connexion à la base de données

Vérifier que les conteneurs PostgreSQL sont démarrés :
```bash
docker ps | grep postgres
```

### Problème avec Kafka

Vérifier que Kafka est démarré et accessible :
```bash
docker logs kafka
```

### Réinitialiser les bases de données

Pour supprimer toutes les données et recommencer :
```bash
docker-compose down -v
docker-compose up -d
```
