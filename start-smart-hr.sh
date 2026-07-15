#!/bin/bash

echo "🚀 Démarrage de Smart HR Sourcing..."

# Démarrer Docker
cd /home/iamsouane/Projects/smart-hr-sourcing
docker-compose up -d
echo "✅ Services Docker démarrés"

# Démarrer Discovery
gnome-terminal --tab --title="Discovery" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/discovery-service && ./mvnw spring-boot:run; exec bash" &
sleep 15

# Démarrer Config
gnome-terminal --tab --title="Config" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/config-service && ./mvnw spring-boot:run; exec bash" &
sleep 10

# Démarrer Gateway
gnome-terminal --tab --title="Gateway" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/gateway-service && ./mvnw spring-boot:run; exec bash" &
sleep 10

# Démarrer Auth
gnome-terminal --tab --title="Auth" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/auth-service && ./mvnw spring-boot:run; exec bash" &
sleep 10

# Démarrer Job
gnome-terminal --tab --title="Job" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/job-service && ./mvnw spring-boot:run; exec bash" &
sleep 10

# Démarrer Candidate
gnome-terminal --tab --title="Candidate" -- bash -c "cd /home/iamsouane/Projects/smart-hr-sourcing/microservices/candidate-service && ./mvnw spring-boot:run; exec bash" &

echo "✅ Tous les services sont en cours de démarrage..."
echo "   Discovery: http://localhost:8761"
echo "   Gateway:   http://localhost:8080"
echo "   Auth:      http://localhost:8081"
echo "   Job:       http://localhost:8082"
echo "   Candidate: http://localhost:8083"
echo "   AI:        http://localhost:8084 (Docker)"
