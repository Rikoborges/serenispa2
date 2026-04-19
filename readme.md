# SereniSpa - API de Gestion de Massages & Réservations

Bienvenue sur le projet **SereniSpa**, une application de gestion de massages conçue pour offrir une expérience relaxante et sécurisée. Ce projet a été développé dans le cadre de ma certification (Titre RNCP), en suivant les bonnes pratiques de développement Node.js.

##  Fonctionnalités
- **Authentification sécurisée** : Inscription et connexion avec hachage de mot de passe (Bcrypt).
- **Gestion des Massages** : Consultation du catalogue de soins.
- **Réservations** : Système de réservation lié à un compte utilisateur.
- **Sécurité renforcée** : Protection des routes via des middlewares et des tokens JWT.
- **Validation** : Contrôle strict des données d'entrée avec Joi.

##  Stack Technique
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB Atlas (NoSQL)
- **Modélisation** : Mongoose
- **Sécurité** : Helmet, CORS, Bcrypt, JSON Web Token (JWT)
- **Tests** : Jest & Supertest
- **Documentation** : Swagger (OpenAPI 3.0)

##  Architecture (MVC)
Le projet suit le modèle **Modèle-Vue-Contrôleur** pour une meilleure séparation des responsabilités :
- `src/models` : Définition des schémas de données.
- `src/controllers` : Logique métier et interaction avec la base de données.
- `src/routes` : Définition des points de terminaison (endpoints) de l'API.
- `src/middleware` : Fonctions de sécurité (Auth, Validation).

##  Sécurité et RGPD
- **Hachage** : Utilisation de `bcrypt` pour ne jamais stocker de mots de passe en clair.
- **JWT** : Authentification stateless pour sécuriser les échanges.
- **Sanitisation** : Utilisation de `helmet` pour protéger contre les vulnérabilités HTTP courantes.

##  Documentation & Tests
- **Swagger** : La documentation interactive est disponible sur `/api-docs` une fois le serveur lancé.
- **Tests** : Exécution des tests d'intégration avec la commande `npm test`.

---
*Projet réalisé pour la validation du titre RNCP.*

## 🌐 Déploiement
- **Frontend** : Hébergé sur Vercel ([https://serenispa-devs.vercel.app/](https://serenispa-devs.vercel.app/))
- **Backend** : API REST connectée à MongoDB Atlas.