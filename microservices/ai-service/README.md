# AI Service - Microservice d'analyse IA et matching CV

Service Spring Boot pour l'analyse de CV et le matching avec des offres d'emploi utilisant Spring AI et Ollama.

## Prérequis

- Java 17+
- Maven 3.8+
- Docker & Docker Compose
- Ollama (pour les fonctionnalités IA)

## Installation et démarrage d'Ollama

Ollama est requis pour les fonctionnalités d'analyse IA. Suivez ces étapes:

1. **Télécharger et installer Ollama:**
   - Windows: https://ollama.ai/download
   - macOS: `brew install ollama`
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`

2. **Démarrer Ollama:**
   ```bash
   ollama serve
   ```
   (Laissez ce terminal ouvert)

3. **Télécharger le modèle requis:**
   ```bash
   ollama pull llama3.2
   ```

4. **Vérifier l'installation:**
   ```bash
   ollama run llama3.2 "Hello"
   ```

Ollama sera accessible sur `http://localhost:11434`

## Démarrage avec Docker Compose

1. **Configurer les variables d'environnement (optionnel):**
   - Le service utilise par défaut `http://host.docker.internal:11434/v1` pour Ollama
   - Sur Linux, vous devrez peut-être utiliser l'adresse IP de votre machine

2. **Démarrer les services:**
   ```bash
   docker-compose up -d kafka postgres-vector ai-service
   ```

3. **Vérifier que le service est démarré:**
   ```bash
   curl http://localhost:8084/api/ai/health
   ```
   Réponse attendue: `{"service":"AI Service","status":"UP","timestamp":...}`

## Démarrage local (sans Docker)

1. **Configurer la base de données PostgreSQL avec pgvector:**
   - Assurez-vous que PostgreSQL 16 avec l'extension pgvector est installé
   - Créez la base de données `vector_db`
   - Activez l'extension: `CREATE EXTENSION vector;`

2. **Configurer application.yml:**
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/vector_db
       username: user
       password: password
     ai:
       openai:
         base-url: http://localhost:11434/v1
         api-key: sk-test
         chat:
           options:
             model: llama3.2
   ```

3. **Démarrer l'application:**
   ```bash
   mvn spring-boot:run
   ```

## API Endpoints

### Health Check
```
GET /api/ai/health
```
Retourne le statut du service.

### Analyser un CV
```
POST /api/ai/analyze
Content-Type: application/json

{
  "cvText": "Texte du CV...",
  "jobDescription": "Description de l'offre...",
  "jobTitle": "Titre du poste"
}
```
Retourne une analyse IA du CV avec:
- `summary`: Résumé de l'analyse
- `strengths`: Points forts du candidat
- `weaknesses`: Points faibles ou manques
- `success`: Statut de la requête

### Générer un embedding
```
POST /api/ai/embedding
Content-Type: application/json

{
  "text": "Texte à vectoriser..."
}
```
Retourne:
- `embedding`: Vecteur de l'embedding
- `dimension`: Dimension du vecteur
- `success`: Statut de la requête

### Calculer la similarité
```
POST /api/ai/similarity
Content-Type: application/json

{
  "vectorA": [0.1, 0.2, ...],
  "vectorB": [0.3, 0.4, ...]
}
```
Retourne:
- `similarity`: Score de similarité cosine (0-1)
- `success`: Statut de la requête

## Documentation Swagger

Une fois le service démarré, accédez à:
```
http://localhost:8084/swagger-ui.html
```

## Configuration

### Variables d'environnement

- `SPRING_DATASOURCE_URL`: URL de connexion PostgreSQL
- `SPRING_DATASOURCE_USERNAME`: Utilisateur PostgreSQL
- `SPRING_DATASOURCE_PASSWORD`: Mot de passe PostgreSQL
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`: Adresses des serveurs Kafka
- `OLLAMA_BASE_URL`: URL de l'API Ollama (défaut: `http://host.docker.internal:11434/v1`)
- `OLLAMA_API_KEY`: Clé API Ollama (défaut: `sk-test`)
- `OLLAMA_MODEL`: Modèle Ollama à utiliser (défaut: `llama3.2`)

### Dépendances principales

- Spring Boot 3.4.5
- Spring AI 1.0.0-M6
- Spring Data JPA
- PostgreSQL + pgvector
- Kafka
- Apache PDFBox (traitement PDF)
- Apache Tika (extraction de texte)

## Structure du projet

```
ai-service/
├── src/main/java/com/smarthr/ai/
│   ├── AiServiceApplication.java       # Classe principale
│   ├── config/
│   │   ├── SpringAIConfig.java          # Configuration Spring AI
│   │   └── SwaggerConfig.java          # Configuration Swagger
│   ├── controller/
│   │   └── AIController.java           # Endpoints REST
│   ├── entity/
│   │   └── Embedding.java              # Entité JPA
│   ├── service/
│   │   ├── EmbeddingService.java       # Service IA
│   │   └── PDFParserService.java       # Service PDF
│   ├── repository/
│   │   └── EmbeddingRepository.java    # Repository JPA
│   ├── kafka/
│   │   └── CVConsumer.java             # Consommateur Kafka
│   └── event/
│       ├── CVUploadedEvent.java
│       └── CVAnalyzedEvent.java
├── src/main/resources/
│   └── application.yml                 # Configuration
└── Dockerfile                         # Configuration Docker
```

## Dépannage

### Ollama ne fonctionne pas
- Vérifiez que Ollama est en cours d'exécution: `curl http://localhost:11434/api/tags`
- Vérifiez que le modèle est téléchargé: `ollama list`
- Sur Docker, utilisez `host.docker.internal` pour accéder à Ollama depuis le conteneur

### Erreur "type vector does not exist"
- Assurez-vous que PostgreSQL avec pgvector est utilisé
- Vérifiez que l'extension est activée: `CREATE EXTENSION vector;`
- Recréez le conteneur postgres-vector avec le script d'initialisation

### Erreur de connexion Kafka
- Vérifiez que Kafka est démarré: `docker-compose ps`
- Les erreurs Kafka ne sont pas critiques pour les tests API directs

### Service ne démarre pas
- Vérifiez les logs: `docker logs ai-service`
- Assurez-vous que le port 8084 n'est pas déjà utilisé
- Vérifiez que PostgreSQL est accessible

## Développement

### Build local
```bash
mvn clean package
```

### Tests
```bash
mvn test
```

### Build Docker
```bash
docker build -t ai-service .
```

## Notes importantes

- Le service peut démarrer sans Ollama, mais les fonctionnalités IA retourneront un message par défaut
- L'extension pgvector est requise pour stocker les vecteurs d'embeddings
- Kafka est utilisé pour la communication asynchrone entre microservices
- Le service utilise Spring AI avec l'API compatible OpenAI d'Ollama

## Licence

Propriétaire - Smart HR Sourcing
