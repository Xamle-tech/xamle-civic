# Guide de Test — Xamle Civic

## Tests Automatiques

### 1. Tests API (Backend)

```bash
# Tester tous les comptes de connexion
node test-login-manual.js

# Tester le flux complet (API + routes protégées)
./test-auth-flow.sh
```

### 2. Tests E2E (Frontend + Backend)

```bash
cd apps/web

# Installer les navigateurs Playwright (première fois uniquement)
pnpm exec playwright install

# Lancer les tests
pnpm test:e2e

# Lancer les tests en mode UI (interactif)
pnpm test:e2e:ui

# Lancer les tests avec navigateur visible
pnpm test:e2e:headed
```

## Tests Manuels

### Comptes de Démo

Tous les comptes utilisent le mot de passe : **Admin@1234** (A majuscule)

| Email | Rôle | Redirection après login |
|-------|------|------------------------|
| admin@xamle.sn | Super Admin | /admin/policies |
| moderateur@xamle.sn | Modérateur | /admin/policies |
| editeur@xamle.sn | Éditeur | /admin/policies |
| citoyen@example.sn | Citoyen | /dashboard/overview |

### Scénarios de Test

#### 1. Connexion Admin

1. Ouvrir http://localhost:3001/auth/login
2. Ouvrir DevTools (F12) → Console
3. Se connecter avec `admin@xamle.sn` / `Admin@1234`
4. **Vérifications :**
   - Console affiche `[LOGIN] Success`
   - Console affiche `[STORE] Setting user`
   - Console affiche `[STORE] Cookies set`
   - Redirection vers `/admin/policies`
   - Application → Cookies contient `access_token` et `user_role=SUPER_ADMIN`

#### 2. Connexion Citoyen

1. Se connecter avec `citoyen@example.sn` / `Admin@1234`
2. **Vérifications :**
   - Redirection vers `/dashboard/overview`
   - Cookie `user_role=CONTRIBUTOR`

#### 3. Protection des Routes

1. Se déconnecter (ou ouvrir en navigation privée)
2. Essayer d'accéder à `/admin/policies`
3. **Vérification :** Redirection vers `/auth/login?redirect=/admin/policies`

#### 4. Restriction Admin

1. Se connecter en tant que citoyen
2. Essayer d'accéder à `/admin/policies`
3. **Vérification :** Redirection vers `/dashboard/overview`

#### 5. Credentials Invalides

1. Essayer de se connecter avec `wrong@example.com` / `wrongpassword`
2. **Vérification :** Message d'erreur "Email ou mot de passe incorrect"

#### 6. Normalisation Email

1. Essayer de se connecter avec `  ADMIN@XAMLE.SN  ` (espaces + majuscules)
2. **Vérification :** Connexion réussie (email normalisé automatiquement)

### Logs de Débogage

Les logs suivants apparaissent dans la console du navigateur :

- `[LOGIN]` : Événements de connexion
- `[STORE]` : Gestion du state utilisateur et cookies
- `[MIDDLEWARE]` : Vérification des routes protégées

Pour désactiver ces logs en production, retirer les `console.log` dans :
- `apps/web/app/(auth)/auth/login/page.tsx`
- `apps/web/stores/userStore.ts`
- `apps/web/middleware.ts`

## Problèmes Connus et Solutions

### "Connexion fonctionne parfois, parfois non"

**Causes possibles :**

1. **Cookies non définis** : Vérifier dans DevTools → Application → Cookies
   - Solution : Attendre 100ms après `setUser` avant redirection (déjà implémenté)

2. **API non démarrée** : 
   ```bash
   curl http://localhost:4000/api/v1/auth/login
   ```
   - Si erreur : redémarrer l'API avec `cd apps/api && node dist/main`

3. **Cache navigateur** :
   - Solution : Vider le cache ou tester en navigation privée

4. **Middleware bloque** : Vérifier les logs `[MIDDLEWARE]` dans la console
   - Si pas de token : les cookies n'ont pas été définis
   - Si mauvais rôle : vérifier le cookie `user_role`

### "Redirection vers page inexistante"

Vérifier que les pages suivantes existent :
- `/admin/policies` → `apps/web/app/(admin)/admin/policies/page.tsx`
- `/dashboard/overview` → `apps/web/app/(dashboard)/dashboard/overview/page.tsx`

### "Email ne fonctionne pas"

L'email est normalisé (trim + lowercase) côté API et frontend.
Si problème persiste :

1. Vérifier le seed : `cd apps/api && pnpm run db:seed`
2. Vérifier l'email en base :
   ```sql
   SELECT email, role FROM "User";
   ```

## Checklist Avant Déploiement

- [ ] Retirer les logs de débogage (`console.log`)
- [ ] Retirer l'encadré "Comptes de démo" de la page login (condition `NODE_ENV === 'development'`)
- [ ] Vérifier que `Secure` est activé pour les cookies en production
- [ ] Tester tous les scénarios en navigation privée
- [ ] Vérifier que les tests E2E passent
- [ ] Vérifier les logs API pour les erreurs
