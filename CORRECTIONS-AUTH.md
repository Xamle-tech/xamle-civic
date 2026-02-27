# Corrections du Flux d'Authentification

## Problèmes Identifiés

1. **Credentials fonctionnent parfois, parfois non**
   - Cause : Race condition entre la définition des cookies et la redirection
   - Cause : Normalisation de l'email incohérente entre frontend et backend

2. **Redirection vers pages inexistantes**
   - Cause : Les pages étaient bien créées mais les cookies n'étaient pas toujours définis à temps

## Corrections Apportées

### 1. Normalisation de l'Email

**Backend** (`apps/api/src/modules/auth/auth.controller.ts`) :
```typescript
async login(@Body() dto: LoginDto, ...) {
  // Normalize email (trim + lowercase) before processing
  const normalizedDto = { ...dto, email: dto.email.trim().toLowerCase() };
  const result = await this.auth.login(normalizedDto);
  ...
}
```

**Backend Service** (`apps/api/src/modules/auth/auth.service.ts`) :
```typescript
async login(dto: LoginDto) {
  const email = dto.email.trim().toLowerCase();
  const user = await this.prisma.user.findUnique({ where: { email } });
  ...
}
```

**Frontend** (`packages/types/src/dtos.ts`) :
```typescript
export const LoginSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(1),
});
```

### 2. Gestion des Cookies avec Délai

**Frontend** (`apps/web/app/(auth)/auth/login/page.tsx`) :
```typescript
onSuccess: (data) => {
  console.log('[LOGIN] Success:', { email: data.user.email, role: data.user.role });
  
  // Set user state and cookies
  setUser(data.user, data.accessToken, data.expiresIn);
  
  // Wait for cookies to be set before redirect
  setTimeout(() => {
    const target = safeRedirect ?? (isAdmin ? '/admin/policies' : '/dashboard/overview');
    console.log('[LOGIN] Redirecting to:', target);
    router.push(target);
  }, 100);
}
```

### 3. Cookies Sécurisés

**Frontend** (`apps/web/stores/userStore.ts`) :
```typescript
setUser: (user, token, expiresIn) => {
  console.log('[STORE] Setting user:', { email: user.email, role: user.role, expiresIn });
  setAccessToken(token);
  
  const maxAge = expiresIn;
  const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
  document.cookie = `access_token=${token}; ${cookieOptions}`;
  document.cookie = `user_role=${user.role}; ${cookieOptions}`;
  
  console.log('[STORE] Cookies set:', {
    access_token: document.cookie.includes('access_token'),
    user_role: document.cookie.includes('user_role'),
  });
  
  set({ user, accessToken: token, expiresAt: Date.now() + expiresIn * 1000 });
}
```

### 4. Logs de Débogage dans le Middleware

**Frontend** (`apps/web/middleware.ts`) :
```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get('access_token')?.value;
  const roleCookie = request.cookies.get('user_role')?.value;

  console.log('[MIDDLEWARE]', {
    pathname,
    hasToken: !!token,
    role: roleCookie,
    cookies: request.cookies.getAll().map(c => c.name),
  });

  if (!token) {
    console.log('[MIDDLEWARE] No token, redirecting to login');
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdmin && !['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'EDITOR'].includes(roleCookie ?? '')) {
    console.log('[MIDDLEWARE] Non-admin trying to access admin route, redirecting');
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  console.log('[MIDDLEWARE] Access granted');
  return NextResponse.next();
}
```

### 5. Affichage des Comptes de Démo

**Frontend** (`apps/web/app/(auth)/auth/login/page.tsx`) :
```typescript
{process.env.NODE_ENV === 'development' && (
  <div className="text-xs text-muted-foreground border border-border rounded-lg p-3 bg-muted/50 space-y-1">
    <p className="font-medium text-foreground">Comptes de démo (mot de passe : Admin@1234)</p>
    <ul className="list-disc list-inside space-y-0.5">
      <li>admin@xamle.sn — Super Admin</li>
      <li>moderateur@xamle.sn — Modérateur</li>
      <li>editeur@xamle.sn — Éditeur</li>
      <li>citoyen@example.sn — Citoyen</li>
    </ul>
    <p className="text-[11px] pt-1">A majuscule dans Admin@1234</p>
  </div>
)}
```

## Tests Créés

### 1. Script de Test API (`test-login-manual.js`)
- Teste les 4 comptes
- Vérifie les credentials invalides
- Vérifie la normalisation de l'email

### 2. Script de Test Complet (`test-auth-flow.sh`)
- Teste l'API
- Vérifie que le web app tourne
- Teste les routes protégées

### 3. Tests E2E Playwright (`apps/web/e2e/auth.spec.ts`)
- Login admin → redirection `/admin/policies`
- Login modérateur → redirection `/admin/policies`
- Login éditeur → redirection `/admin/policies`
- Login citoyen → redirection `/dashboard/overview`
- Credentials invalides
- Routes protégées
- Restriction admin
- Paramètre redirect
- Normalisation email

## Résultats des Tests

```bash
$ node test-login-manual.js

🧪 Testing Xamle Civic Login Flow
=====================================

📡 Testing valid credentials:
------------------------------
✅ admin@xamle.sn: Login OK → /admin/policies (role: SUPER_ADMIN)
✅ moderateur@xamle.sn: Login OK → /admin/policies (role: MODERATOR)
✅ editeur@xamle.sn: Login OK → /admin/policies (role: EDITOR)
✅ citoyen@example.sn: Login OK → /dashboard/overview (role: CONTRIBUTOR)

📡 Testing invalid credentials:
--------------------------------
✅ Invalid credentials: Correctly rejected

📡 Testing email normalization:
--------------------------------
✅ Email normalization: Uppercase and spaces handled correctly

=====================================
✅ Passed: 6
❌ Failed: 0
=====================================

🎉 All tests passed!
```

## Instructions de Test Manuel

1. **Ouvrir le navigateur** : http://localhost:3001/auth/login
2. **Ouvrir DevTools** : F12 → Console
3. **Se connecter** avec n'importe quel compte (ex: `admin@xamle.sn` / `Admin@1234`)
4. **Vérifier les logs** :
   - `[LOGIN] Success`
   - `[STORE] Setting user`
   - `[STORE] Cookies set`
   - `[MIDDLEWARE]` (lors de la redirection)
5. **Vérifier les cookies** : DevTools → Application → Cookies
   - `access_token` doit être présent
   - `user_role` doit correspondre au rôle

## Fichiers Modifiés

- ✅ `apps/api/src/modules/auth/auth.controller.ts` — Normalisation email
- ✅ `apps/api/src/modules/auth/auth.service.ts` — Normalisation email (déjà fait)
- ✅ `apps/web/app/(auth)/auth/login/page.tsx` — Délai redirection + logs + comptes démo
- ✅ `apps/web/stores/userStore.ts` — Cookies sécurisés + logs
- ✅ `apps/web/middleware.ts` — Logs de débogage
- ✅ `packages/types/src/dtos.ts` — Normalisation email dans schema
- ✅ `test-login-manual.js` — Script de test API
- ✅ `test-auth-flow.sh` — Script de test complet
- ✅ `apps/web/e2e/auth.spec.ts` — Tests E2E Playwright
- ✅ `apps/web/playwright.config.ts` — Configuration port 3001
- ✅ `apps/web/package.json` — Scripts de test E2E

## Prochaines Étapes

1. **Tester manuellement** dans le navigateur avec les 4 comptes
2. **Vérifier les logs** dans la console pour diagnostiquer tout problème
3. **Retirer les logs** avant la mise en production (chercher `console.log('[LOGIN]')`, `[STORE]`, `[MIDDLEWARE]`)
4. **Retirer l'encadré des comptes de démo** en production (condition `NODE_ENV === 'development'` déjà en place)
