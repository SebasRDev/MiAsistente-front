# Arquitectura de Autenticación - Comparación

## ❌ IMPLEMENTACIÓN ACTUAL (Problemática)

```
┌─────────────────────────────────────────────────────────┐
│ layout.tsx (Server Component)                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ const session = cookies.get('user-session')     │   │
│ └────────────────────┬────────────────────────────┘   │
│                      │                                  │
│                      ▼                                  │
│ ┌─────────────────────────────────────────────────┐   │
│ │ <Header session={session} />                    │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Header.tsx (Client Component)                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ const [user] = useAuthState(firebaseAuth)       │   │
│ │ const [firestoreData] = useDocumentData(...)    │   │
│ │ const userData = state.user (QuoteContext)      │   │
│ │                                                  │   │
│ │ // Sincronización manual:                       │   │
│ │ useEffect(() => {                                │   │
│ │   if (!user || !session) {                      │   │
│ │     dispatch({ type: 'CLEAR_USER' })            │   │
│ │   }                                              │   │
│ │   if (user && session) {                        │   │
│ │     dispatch({ type: 'SET_USER', ... })         │   │
│ │   }                                              │   │
│ │ }, [user, session, firestoreData])              │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

PROBLEMAS:
1. ❌ 4 fuentes de verdad: session (cookie) + user (auth) + firestoreData + state.user
2. ❌ Sincronización manual compleja
3. ❌ useDocumentData = listener costoso (onSnapshot)
4. ❌ Desincronización posible entre cookie y Firebase Auth
5. ❌ session prop pasa datos del servidor al cliente innecesariamente
```

## ✅ NUEVA IMPLEMENTACIÓN (Simplificada)

```
┌─────────────────────────────────────────────────────────┐
│ layout.tsx (Server Component)                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ // ✅ YA NO SE NECESITA leer la cookie          │   │
│ │ // El middleware ya protege las rutas           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ <Header />  ← Sin prop session                  │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ AuthProvider (Client Component - wraps entire app)     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ useEffect(() => {                                │   │
│ │   onAuthStateChanged((firebaseUser) => {        │   │
│ │     if (firebaseUser) {                         │   │
│ │       const doc = await getDoc(...)  // 1 read  │   │
│ │       setUser(firebaseUser)                     │   │
│ │       setProfile(doc.data())                    │   │
│ │     } else {                                     │   │
│ │       setUser(null)                             │   │
│ │       setProfile(null)                          │   │
│ │     }                                            │   │
│ │   })                                             │   │
│ │ }, [])                                           │   │
│ └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Header.tsx (Client Component)                          │
│ ┌─────────────────────────────────────────────────┐   │
│ │ const { user, profile, loading } = useAuth()    │   │
│ │                                                  │   │
│ │ if (loading) return <Skeleton />                │   │
│ │ if (!profile) return <HeaderPublic />           │   │
│ │ return <HeaderWithMenu profile={profile} />     │   │
│ └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

BENEFICIOS:
1. ✅ 1 sola fuente de verdad: AuthContext (user + profile)
2. ✅ Sincronización automática
3. ✅ 1 read de Firestore por login (vs. listener continuo)
4. ✅ No más prop drilling de session
5. ✅ Código más simple y mantenible
```

## ¿Por Qué NO Necesitas session Prop?

### Caso 1: Usuario con sesión válida
```typescript
// layout.tsx - Server
cookies.get('user-session') // ← Existe (uid: "abc123")

// AuthProvider - Client
onAuthStateChanged → firebaseUser existe
→ setUser(firebaseUser)
→ fetch profile from Firestore
→ setProfile({...})

// Header.tsx - Client
const { profile } = useAuth()
// profile = {...data} → Muestra menú
```

### Caso 2: Usuario sin sesión
```typescript
// layout.tsx - Server
cookies.get('user-session') // ← null

// Middleware
if (!session) redirect('/') // ← Usuario ni siquiera ve la página

// AuthProvider - Client (si llega aquí)
onAuthStateChanged → firebaseUser = null
→ setUser(null)
→ setProfile(null)

// Header.tsx - Client
const { profile } = useAuth()
// profile = null → No muestra menú
```

### Caso 3: Cookie existe pero Firebase Auth expiró (desincronización)
```typescript
// ❌ ANTES: Problema de sincronización
// layout.tsx
session = "abc123" // Cookie existe

// Header.tsx
user = null // Firebase Auth expiró
// ¿Qué mostrar? session dice "sí", user dice "no"

// ✅ AHORA: AuthContext es la fuente de verdad
// AuthProvider
onAuthStateChanged → firebaseUser = null
→ setProfile(null)

// Header.tsx
const { profile } = useAuth()
// profile = null → No muestra menú
// ✅ Firebase Auth es la autoridad, cookie es solo para middleware
```

## Separación de Responsabilidades

| Componente | Responsabilidad | Tecnología |
|------------|----------------|------------|
| **Middleware** | Protección de rutas (server-side) | Verifica cookie |
| **AuthContext** | Estado de autenticación (client-side) | Firebase Auth + Firestore |
| **Header** | UI basada en estado | Lee de AuthContext |

**La cookie y Firebase Auth trabajan juntos pero independientes:**
- **Cookie**: "¿Puede este usuario ver esta página?" (middleware)
- **Firebase Auth**: "¿Quién es este usuario y qué puede hacer?" (client)

## Migración Recomendada

### layout.tsx
```typescript
// ❌ ANTES
const sessionCookie = (await cookieStore).get('user-session');
const session = sessionCookie?.value || null;
<Header session={session} />

// ✅ DESPUÉS
<Header />  // No necesita prop
```

### Header.tsx
```typescript
// ❌ ANTES
const Header = ({ session }: { session: string | null }) => {
  const [user] = useAuthState(firebaseAuth);
  const [firestoreData] = useDocumentData(...);
  const userData = state.user;

  useEffect(() => {
    if (!user || !session) {
      dispatch({ type: 'CLEAR_USER' });
    }
  }, [user, session]);
}

// ✅ DESPUÉS
const Header = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return <Skeleton />;
  // Listo, AuthContext ya sincronizó todo
}
```
