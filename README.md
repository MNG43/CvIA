# Smart HR Sourcing

> Recruteur virtuel et analyseur intelligent de CV — plateforme de recrutement basée sur une architecture microservices (Spring Boot + Spring Cloud + Angular + IA).

Projet académique JEE réalisé en équipe de 4, illustrant une architecture microservices complète : API Gateway, service discovery, configuration centralisée, communication asynchrone par événements, et une brique d'analyse de CV par intelligence artificielle (matching sémantique via embeddings).

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Ports par défaut](#ports-par-défaut)
- [Documentation des API](#documentation-des-api)
- [Modélisation](#modélisation)
- [Équipe](#équipe)
- [Planning](#planning)

---

## Fonctionnalités

- Authentification sécurisée par JWT, gestion des rôles `ADMIN` / `RECRUTEUR`
- Création et gestion des offres d'emploi
- Dépôt de plusieurs CV (PDF) pour une offre donnée
- Extraction automatique du contenu des CV (Apache PDFBox / Tika)
- Analyse et scoring de matching CV ↔ offre par mots-clés ou par recherche sémantique (embeddings, PgVector)
- Classement automatique des candidats
- Résumé IA des points forts / points faibles de chaque candidat
- Pipeline de recrutement type Kanban (drag & drop)
- Tableau de bord et statistiques de recrutement
- Notifications déclenchées par les événements du pipeline

## Architecture

Le projet est découpé en microservices autonomes, chacun propriétaire de sa propre base de données (pattern *Database per Service*). Le front-end Angular ne communique qu'avec l'API Gateway, qui route les requêtes vers le microservice concerné. Les traitements longs (analyse IA) sont déclenchés de façon asynchrone via un bus d'événements Kafka plutôt que par appel bloquant.

```
                              ┌─────────────────────┐
                              │   Angular (SPA)      │
                              └──────────┬───────────┘
                                         │
                              ┌──────────▼───────────┐
                              │   API Gateway         │
                              └──┬───┬───┬───┬───┬────┘
                 ┌───────────────┘   │   │   │   └───────────────┐
          ┌──────▼─────┐   ┌────────▼┐ ┌▼───────┐ ┌──────────────▼┐
          │Auth Service│   │Job Serv.│ │Candidate│ │Notification   │
          └──────┬─────┘   └────┬────┘ │Service  │ │Service        │
                 │              │       └────┬────┘ └───────┬───────┘
             auth_db         job_db          │  Kafka  ┌────▼─────┐
                                              └─────────►AI/Matching│
                                                         │Service    │
                                                         └────┬──────┘
                                                            vector_db
```

Composants transverses :

- **Service Discovery** (Eureka) — enregistrement et découverte dynamique des services
- **Config Server** — configuration centralisée et versionnée
- **API Gateway** — point d'entrée unique, routage, sécurité JWT
- **Kafka** — bus d'événements (`cv.uploaded`, `cv.analyzed`, `interview.scheduled`, ...)

Le diagramme d'architecture détaillé et les diagrammes UML (cas d'utilisation, classes) se trouvent dans [`docs/UML`](./docs/UML).

## Stack technique

**Backend / infrastructure**
- Java 17, Spring Boot, Spring Web, Spring Data JPA, Spring Security
- Spring Cloud Gateway, Spring Cloud Netflix Eureka, Spring Cloud Config
- Spring AI (embeddings / recherche sémantique)
- Apache PDFBox (extraction du texte des CV)
- Apache Kafka
- PostgreSQL + extension PgVector
- Docker / Docker Compose
- Lombok, MapStruct
- Swagger / OpenAPI

**Frontend**
- Angular 17, Angular Material
- Tailwind CSS / Bootstrap
- Chart.js / ngx-charts
- Angular CDK (drag & drop)
- RxJS

## Structure du projet

```
smart-hr-sourcing/
├── docker-compose.yml          # Infrastructure : PostgreSQL, Kafka, ...
├── docs/
│   └── UML/                    # Diagrammes de cas d'utilisation et de classes
├── frontend/
│   └── smart-hr-ui/            # Application Angular
├── microservices/
│   ├── discovery-service/      # Eureka Server
│   ├── config-service/         # Spring Cloud Config Server
│   ├── gateway-service/        # API Gateway (Spring Cloud Gateway)
│   ├── auth-service/           # Authentification, JWT, utilisateurs, rôles
│   ├── job-service/            # Gestion des offres d'emploi
│   ├── candidate-service/      # Candidats, upload CV, pipeline de recrutement
│   ├── ai-service/             # Extraction, embeddings, matching, résumé IA
│   └── notification-service/   # Envoi d'e-mails / alertes
└── README.md
```

## Prérequis

| Outil | Version recommandée |
|---|---|
| Java (JDK) | 17+ |
| Maven | intégré via `./mvnw` |
| Node.js | 18+ |
| Angular CLI | 17+ |
| Docker & Docker Compose | dernière version stable |

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone git@github.com:iamsouane/smart-hr-sourcing.git
cd smart-hr-sourcing
```

### 2. Démarrer l'infrastructure (PostgreSQL, Kafka, ...)

```bash
docker-compose up -d
```

### 3. Lancer les microservices back-end

L'ordre de démarrage doit être respecté, chaque service dépendant des précédents pour s'enregistrer et récupérer sa configuration.

```bash
# 1. Service Discovery (Eureka)
cd microservices/discovery-service && ./mvnw spring-boot:run

# 2. Config Server
cd microservices/config-service && ./mvnw spring-boot:run

# 3. API Gateway
cd microservices/gateway-service && ./mvnw spring-boot:run

# 4. Auth Service
cd microservices/auth-service && ./mvnw spring-boot:run

# 5. Job Service
cd microservices/job-service && ./mvnw spring-boot:run

# 6. Candidate Service
cd microservices/candidate-service && ./mvnw spring-boot:run

# 7. AI / Matching Service
cd microservices/ai-service && ./mvnw spring-boot:run

# 8. Notification Service
cd microservices/notification-service && ./mvnw spring-boot:run
```

> Astuce : chaque commande est à lancer dans un terminal séparé, ou via le support multi-run de votre IDE (IntelliJ permet de créer une configuration de lancement composite).

### 4. Lancer le frontend Angular

```bash
cd frontend/smart-hr-ui
npm install
ng serve
```

L'application est alors accessible sur `http://localhost:4200`.

## Ports par défaut

| Service | Port |
|---|---|
| Discovery Service (Eureka) | 8761 |
| Config Service | 8888 |
| Gateway Service | 8080 |
| Auth Service | 8081 |
| Job Service | 8082 |
| Candidate Service | 8083 |
| AI / Matching Service | 8084 |
| Notification Service | 8085 |
| Frontend Angular | 4200 |
| PostgreSQL | 5432 |
| Kafka | 9092 |

## Documentation des API

Chaque microservice expose sa propre documentation Swagger / OpenAPI, accessible individuellement (`http://localhost:<port>/swagger-ui.html`) ou agrégée via l'API Gateway une fois celle-ci configurée.

---

## Test rapide avec Docker

### Lancement des services

```bash
docker-compose up -d
```

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

### Exemples de requêtes API

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Récupérer toutes les offres
curl http://localhost:8082/api/jobs

# Récupérer tous les candidats
curl http://localhost:8083/api/candidates

# Mettre à jour le statut d'une candidature
curl -X PUT "http://localhost:8083/api/candidates/application/1/status?status=ENTRETIEN"
```

Pour plus de détails sur le test des API, consultez [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) et [GUIDE_FONCTIONNEMENT.md](./GUIDE_FONCTIONNEMENT.md).

## Modélisation

Le dossier [`docs/UML`](./docs/UML) contient :
- le diagramme de cas d'utilisation,
- les diagrammes de classes par microservice (bounded context),
- le diagramme d'architecture détaillé.

## Équipe

| Membre | Microservices en charge |
|---|---|
| Membre 1 | Auth Service + API Gateway |
| Membre 2 | Candidate Service + AI / Matching Service |
| Membre 3 | Job Service + Frontend (Dashboard, Offres) |
| Membre 4 | Notification Service + Frontend (Pipeline, Comparaison) |

## Planning

Projet réalisé sur 12 jours, du cadrage de l'architecture (Eureka, Config Server, Gateway) jusqu'à la conteneurisation complète via Docker Compose et la préparation de la soutenance.

---

*Projet académique JEE — Smart HR Sourcing.*