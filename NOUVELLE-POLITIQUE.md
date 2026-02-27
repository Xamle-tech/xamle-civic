# Création de Politique — Correction 404

## ✅ Problème Résolu

Le bouton "Nouvelle politique" dans `/admin/policies` redirigait vers `/admin/policies/new` qui n'existait pas (404).

## 🔧 Corrections Apportées

### 1. Page de Création de Politique

**Fichier** : `apps/web/app/(admin)/admin/policies/new/page.tsx`

Page pour créer une nouvelle politique publique accessible aux rôles : EDITOR, ADMIN, SUPER_ADMIN.

### 2. Page d'Édition de Politique

**Fichier** : `apps/web/app/(admin)/admin/policies/[id]/page.tsx`

Page pour éditer une politique existante. Accepte l'ID de la politique en paramètre.

### 3. Formulaire de Politique Réutilisable

**Fichier** : `apps/web/components/features/admin/PolicyForm.tsx`

Formulaire complet avec :
- **Informations générales** : titre, description, ministère, thème, statut, région
- **Budget et calendrier** : budget total, budget dépensé, dates de début/fin
- **KPIs (Indicateurs)** : liste dynamique d'indicateurs de performance avec nom, objectif, valeur actuelle, unité

**Fonctionnalités** :
- Validation avec Zod (`CreatePolicySchema`)
- Champs dynamiques pour les KPIs (ajouter/supprimer)
- Mode création et édition
- Gestion des erreurs
- Redirection après succès

### 4. Endpoint API Amélioré

**Fichier** : `apps/api/src/modules/policies/policies.controller.ts`

Modification de l'endpoint `GET /policies/:slugOrId` pour accepter soit :
- Un **UUID** (ex: `123e4567-e89b-12d3-a456-426614174000`) → appelle `findById`
- Un **slug** (ex: `programme-modernisation-agriculture`) → appelle `findBySlug`

### 5. Correction du Lien d'Édition

**Fichier** : `apps/web/components/features/admin/AdminPoliciesTable.tsx`

Changement du lien d'édition de `/admin/policies/${id}/edit` vers `/admin/policies/${id}`.

## 📋 Structure des Formulaires

### Champs Obligatoires
- Titre (5-300 caractères)
- Description (20-10000 caractères)
- Ministère (UUID)
- Thème (enum PolicyTheme)

### Champs Optionnels
- Statut (par défaut: NOT_STARTED)
- Budget total (FCFA)
- Budget dépensé (FCFA)
- Date de début
- Date de fin
- Région (enum SenegalRegion)
- KPIs (liste d'indicateurs)

### Structure d'un KPI
```typescript
{
  name: string;        // Ex: "Nombre de bénéficiaires"
  target: number;      // Ex: 10000
  current: number;     // Ex: 3500
  unit: string;        // Ex: "personnes"
}
```

## 🧪 Tests

### Test Manuel

1. **Se connecter** avec un compte EDITOR, ADMIN ou SUPER_ADMIN :
   - `editeur@xamle.sn` / `Admin@1234`
   - `admin@xamle.sn` / `Admin@1234`

2. **Accéder à** : http://localhost:3001/admin/policies

3. **Cliquer sur "Nouvelle politique"**
   - ✅ Devrait afficher le formulaire de création

4. **Remplir le formulaire** :
   - Titre : "Test Politique"
   - Description : "Ceci est une politique de test pour vérifier le formulaire"
   - Sélectionner un ministère
   - Sélectionner un thème
   - (Optionnel) Ajouter des KPIs

5. **Cliquer sur "Créer la politique"**
   - ✅ Devrait créer la politique
   - ✅ Devrait rediriger vers `/admin/policies`
   - ✅ La nouvelle politique devrait apparaître dans le tableau

6. **Cliquer sur l'icône crayon (éditer)**
   - ✅ Devrait afficher le formulaire pré-rempli
   - ✅ Modifier des champs et enregistrer
   - ✅ Devrait mettre à jour la politique

### Test API

```bash
# Créer une politique
curl -X POST http://localhost:4000/api/v1/policies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Politique API",
    "description": "Description de test avec au moins 20 caractères",
    "ministryId": "UUID_DU_MINISTERE",
    "theme": "EDUCATION",
    "status": "NOT_STARTED"
  }'

# Récupérer une politique par ID
curl http://localhost:4000/api/v1/policies/UUID_DE_LA_POLITIQUE

# Récupérer une politique par slug
curl http://localhost:4000/api/v1/policies/test-politique-api

# Modifier une politique
curl -X PUT http://localhost:4000/api/v1/policies/UUID_DE_LA_POLITIQUE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Politique API Modifié"
  }'
```

## 📁 Fichiers Créés/Modifiés

### Créés
- ✅ `apps/web/app/(admin)/admin/policies/new/page.tsx`
- ✅ `apps/web/app/(admin)/admin/policies/[id]/page.tsx`
- ✅ `apps/web/components/features/admin/PolicyForm.tsx`

### Modifiés
- ✅ `apps/api/src/modules/policies/policies.controller.ts` (endpoint accepte UUID ou slug)
- ✅ `apps/web/components/features/admin/AdminPoliciesTable.tsx` (lien d'édition corrigé)

## 🎯 Permissions

Les pages de création et d'édition sont protégées par :
- **Middleware** : vérifie le cookie `access_token`
- **API** : vérifie le rôle via `@Roles(UserRole.EDITOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)`

Les rôles autorisés :
- ✅ EDITOR
- ✅ ADMIN
- ✅ SUPER_ADMIN
- ❌ MODERATOR (lecture seule)
- ❌ CONTRIBUTOR (pas d'accès admin)

## 🚀 État Actuel

- ✅ Page de création fonctionnelle
- ✅ Page d'édition fonctionnelle
- ✅ Formulaire avec validation
- ✅ KPIs dynamiques
- ✅ Endpoint API accepte UUID et slug
- ✅ Lien d'édition corrigé dans le tableau
- ✅ Redirection après succès
- ✅ Gestion des erreurs

## 💡 Améliorations Futures

1. **Upload de fichiers** : permettre d'ajouter des documents sources
2. **Prévisualisation** : afficher un aperçu avant de créer
3. **Brouillons** : sauvegarder automatiquement en brouillon
4. **Validation côté serveur** : messages d'erreur plus détaillés
5. **Historique** : afficher les versions précédentes
6. **Duplication** : permettre de dupliquer une politique existante
