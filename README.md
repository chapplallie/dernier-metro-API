# Dernier Metro API
Une API minimaliste pour aider les usagers parisiens à décider s'ils peuvent attraper le dernier métro.
Imaginez Lina, 00:58, elle sort d'un concert à Châtelet. Elle doit prendre la ligne 1. A-t-elle le temps d'attraper le dernier métro ?
Cette API répond en quelques millisecondes avec la prochaine rame et si c'est la dernière.

# Architecture
Express.js pour l'API REST
Middlewares pour les logs et gestion 404
Docker pour la containerisation

# Démarrage
## 1 : Lancer Node
```bash
npm install
npm start
```

## 2:lancer Docker
```bash
docker build -f Dockerfile.v1 -t dernier-metro .
docker run -p 3000:3000 dernier-metro
```

# Routing
## GET /health
Verifie si le service est UP.

## GET /next-metro?station=NAME
Obtenir les informations sur le prochain métro pour une station donnée.

# Paramètres:
- `station` (required): Nom de la station

# Réponse quand le métro est en circulation :
```json
{
  "station": "Chatelet",
  "line": "M7",
  "headwayMin": 3,
  "nextArrival": "12:34",
  "isLast": false,
  "tz": "Europe/Paris"
}
```

# Réponse quand le métro est fermé :
```json
{
  "station": "Chatelet",
  "line": "M7",
  "service": "closed",
  "tz": "Europe/Paris"
}
```

## Tests
```bash
# Test health check
curl http://localhost:3000/health

# Test endpoint
curl "http://localhost:3000/next-metro?station=Chatelet"

# Test erreur 400
curl http://localhost:3000/next-metro

# Test 404
curl http://localhost:3000/invalid-route
```
