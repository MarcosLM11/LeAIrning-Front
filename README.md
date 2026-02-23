<p align="center">
  <h1 align="center">LeAIrning Frontend</h1>
  <p align="center">
    <strong>SPA Angular 20 con componentes standalone, SSR y diseño basado en features</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Angular-20-DD0031?style=flat-square&logo=angular&logoColor=white" alt="Angular 20"/>
    <img src="https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.9.2"/>
    <img src="https://img.shields.io/badge/PrimeNG-20-DD0031?style=flat-square" alt="PrimeNG 20"/>
    <img src="https://img.shields.io/badge/NgRx%20Signals-20.1-BA2BD2?style=flat-square" alt="NgRx Signals"/>
    <img src="https://img.shields.io/badge/Vitest-3.1.1-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest"/>
    <img src="https://img.shields.io/badge/SSR-Enabled-00C853?style=flat-square" alt="SSR"/>
  </p>
</p>

---

## Tabla de Contenidos

- [Descripcion](#descripcion)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Stack Tecnologico](#stack-tecnologico)
- [Features](#features)
- [Componentes Compartidos](#componentes-compartidos)
- [Servicios](#servicios)
- [Routing y Navegacion](#routing-y-navegacion)
- [Estado y Signals](#estado-y-signals)
- [Interceptors y Guards](#interceptors-y-guards)
- [Sistema de Diseño](#sistema-de-diseno)
- [Testing](#testing)
- [Build y Ejecucion](#build-y-ejecucion)
- [Configuracion](#configuracion)

---

## Descripcion

El frontend de LeAIrning es una **Single Page Application** construida con Angular 20, que utiliza exclusivamente **componentes standalone** (sin NgModules), lazy loading por feature, y Server-Side Rendering (SSR) con Express. 
Se conecta al backend Spring Boot en `http://localhost:8080`. Puedes consultar el código del backend en su respectivo repositorio: [LeAIrning Backend](https://github.com/MarcosLM11/LeAIrning-Back/tree/main).

La interfaz proporciona gestión de documentos, chat conversacional con IA (RAG), generación de quizzes, y un sistema de autenticación completo con login tradicional y OAuth2 (Google, GitHub).

---

## Arquitectura

### Arquitectura hexagonal basada en features

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App Shell                                  │
│  ┌──────────┐  ┌──────────────────────────────────────────────────┐ │
│  │ Sidebar  │  │                  Router Outlet                   │ │
│  │          │  │  ┌────────────────────────────────────────────┐  │ │
│  │  - Dash  │  │  │           Feature (lazy-loaded)            │  │ │
│  │  - Docs  │  │  │                                            │  │ │
│  │  - Chat  │  │  │  Pages (Smart) ──► Services ──► HTTP API   │  │ │
│  │  - Quiz  │  │  │       │                                    │  │ │
│  │          │  │  │  Components (Dumb) ◄── input() / output()  │  │ │
│  │          │  │  │                                            │  │ │
│  └──────────┘  │  └────────────────────────────────────────────┘  │ │
│  ┌──────────┐  │                                                  │ │
│  │ Header   │  │                                                  │ │
│  └──────────┘  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Principios de diseño

| Principio | Implementación |
|---|---|
| **Standalone Components** | Todos los componentes con imports explícitos, sin NgModules |
| **Lazy Loading** | Cada feature se carga bajo demanda con `loadComponent()` |
| **Smart vs Dumb** | Pages (containers) inyectan servicios; Components (presentational) usan `input()`/`output()` |
| **Signal-based State** | `@ngrx/signals` para gestión de estado reactiva |
| **OnPush** | `ChangeDetectionStrategy.OnPush` en todos los componentes |
| **SSR** | Server-Side Rendering con Express 5.1 y `@angular/ssr` |
| **Strict TypeScript** | Modo estricto completo con templates tipados |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                               # Singleton: servicios, guards, interceptors
│   │   ├── api/                            # Configuración base de API
│   │   ├── auth/
│   │   │   └── guards/
│   │   │       └── auth.guard.ts           # Guard funcional de autenticación
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts         # Inyección de JWT Bearer
│   │   │   └── error.interceptor.ts        # Manejo global de errores HTTP
│   │   ├── models/
│   │   │   ├── auth.model.ts               # Interfaces de autenticación
│   │   │   ├── chat.model.ts               # Interfaces de chat/conversación
│   │   │   ├── document.model.ts           # Interfaces de documentos
│   │   │   └── quiz.model.ts               # Interfaces de quizzes
│   │   ├── services/
│   │   │   ├── auth.ts                     # AuthService (login, register, tokens)
│   │   │   ├── chat.ts                     # ChatService (mensajes, conversaciones)
│   │   │   ├── document.ts                 # DocumentService (CRUD documentos)
│   │   │   └── quiz.ts                     # QuizService (generación y listado)
│   │   └── validators/
│   │       └── password-match.validator.ts  # Validador de confirmación de password
│   │
│   ├── features/                           # Módulos por funcionalidad (lazy-loaded)
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/                  # Página de login
│   │   │   │   ├── register/               # Registro multi-step
│   │   │   │   ├── verify/                 # Verificación de email
│   │   │   │   └── exchange/               # Intercambio de auth code OAuth2
│   │   │   └── shared/styles/              # Estilos compartidos de auth
│   │   │
│   │   ├── dashboard/
│   │   │   └── pages/dashboard/            # Panel principal
│   │   │
│   │   ├── documents/
│   │   │   └── pages/
│   │   │       ├── documents/              # Listado de documentos
│   │   │       └── upload/                 # Subida de documentos
│   │   │
│   │   ├── chat/
│   │   │   └── pages/chat/                 # Chat con IA (RAG)
│   │   │
│   │   ├── quizzes/
│   │   │   └── pages/generate/             # Generación de quizzes
│   │   │
│   │   └── error/
│   │       └── pages/error-page/           # Páginas de error (404, 500, genérica)
│   │
│   ├── layout/                             # Shell de la aplicación
│   │   ├── header/                         # Barra de navegación superior
│   │   └── sidebar/                        # Menú lateral colapsable
│   │
│   ├── shared/                             # Reutilizables entre features
│   │   ├── components/
│   │   │   ├── auth-illustration/          # Ilustración SVG para auth
│   │   │   ├── document-selector/          # Selector de documentos para chat
│   │   │   ├── fab-menu/                   # Botón flotante de acciones
│   │   │   ├── hero-section/               # Hero section reutilizable
│   │   │   ├── profile-edit-dialog/        # Diálogo de edición de perfil
│   │   │   ├── profile-view-dialog/        # Diálogo de visualización de perfil
│   │   │   ├── skeleton-loader/            # Placeholder de carga
│   │   │   ├── social-login-buttons/       # Botones OAuth (Google, GitHub)
│   │   │   └── theme-toggle/              # Toggle modo oscuro/claro
│   │   ├── models/
│   │   │   └── file-upload.model.ts
│   │   ├── pipes/
│   │   │   └── document-icon.pipe.ts       # Tipo de fichero → icono PrimeNG
│   │   ├── services/
│   │   │   ├── dialog.ts                   # Gestión de estado de diálogos
│   │   │   ├── storage.service.ts          # Abstracción de localStorage (SSR-safe)
│   │   │   ├── theme.service.ts            # Gestión de tema oscuro/claro
│   │   │   └── toast.service.ts            # Notificaciones toast (PrimeNG)
│   │   ├── styles/
│   │   │   └── _design-system.scss         # Variables CSS del sistema de diseño
│   │   ├── animations/
│   │   │   └── route-animations.ts         # Animaciones de transición entre rutas
│   │   └── utils/
│   │       ├── date.utils.ts               # Utilidades de fechas
│   │       ├── file.utils.ts               # Validación y formateo de ficheros
│   │       └── selection.utils.ts          # Utilidades de selección
│   │
│   ├── app.ts                              # Componente raíz
│   ├── app.config.ts                       # Providers de la aplicación
│   ├── app.config.server.ts                # Providers SSR
│   ├── app.routes.ts                       # Configuración de rutas
│   └── app.routes.server.ts                # Rutas SSR
│
├── environments/
│   ├── environment.ts                      # Desarrollo (localhost:8080)
│   └── environment.prod.ts                 # Producción (api.leairning.com)
│
├── styles.scss                             # Estilos globales + tema PrimeNG
├── main.ts                                 # Bootstrap del navegador
├── main.server.ts                          # Bootstrap SSR
└── server.ts                               # Servidor Express SSR
```

### Convención de nombres

Este proyecto utiliza una convención **sin sufijos** para ficheros:

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Componentes | `kebab-case.ts` | `login.ts`, `header.ts` |
| Servicios | `kebab-case.ts` | `auth.ts`, `document.ts` |
| Guards | `kebab-case.guard.ts` | `auth.guard.ts` |
| Interceptors | `kebab-case.interceptor.ts` | `auth.interceptor.ts` |
| Modelos | `kebab-case.model.ts` | `chat.model.ts` |
| Validadores | `kebab-case.validator.ts` | `password-match.validator.ts` |
| Tests | `kebab-case.spec.ts` | `login.spec.ts` |

---

## Stack Tecnologico

### Runtime

| Tecnología | Versión | Propósito |
|---|---|---|
| Angular | 20.0.0 | Framework SPA con standalone components |
| TypeScript | 5.9.2 | Lenguaje con strict mode completo |
| RxJS | 7.8.0 | Programación reactiva para HTTP y streams |
| zone.js | 0.15.0 | Change detection de Angular |

### UI y Estado

| Tecnología | Versión | Propósito |
|---|---|---|
| PrimeNG | 20.0.0 | Librería de componentes (Aura Light Green) |
| PrimeIcons | 7.0.0 | Iconografía |
| @ngrx/signals | 20.1.0 | Gestión de estado basada en Signals |
| SCSS | - | Preprocesador CSS con sistema de diseño custom |

### SSR y Build

| Tecnología | Versión | Propósito |
|---|---|---|
| @angular/ssr | 20.0.0 | Server-Side Rendering |
| Express | 5.1.0 | Servidor HTTP para SSR |
| esbuild | via @angular/build | Build system rápido |

### Testing

| Tecnología | Versión | Propósito |
|---|---|---|
| Vitest | 3.1.1 | Test runner (reemplazo de Karma/Jasmine) |
| jsdom | 27.1.0 | Simulación de DOM para tests |

### Calidad de código

| Herramienta | Configuración |
|---|---|
| TypeScript Strict | `strict`, `noImplicitReturns`, `strictTemplates` |
| EditorConfig | 2 espacios, UTF-8, single quotes |
| Prettier | Print width 100, single quotes, parser Angular |

---

## Features

### Auth (`/auth/*`)

Sistema de autenticación completo con soporte para login tradicional y OAuth2.

| Página | Ruta | Descripción |
|---|---|---|
| **Login** | `/auth/login` | Login con email/password + botones OAuth2 (Google, GitHub) |
| **Register** | `/auth/register` | Registro multi-step con validación de password |
| **Verify** | `/auth/verify` | Verificación de email mediante token |
| **Exchange** | `/auth/exchange` | Intercambio transparente de auth code por JWT tokens |

### Dashboard (`/dashboard`)

Panel principal con visión general de la actividad del usuario: documentos recientes, conversaciones y accesos directos a funcionalidades.

### Documents (`/documents`)

| Página | Ruta | Descripción |
|---|---|---|
| **Listado** | `/documents` | Tabla con todos los documentos del usuario |
| **Upload** | `/documents/upload` | Subida de documentos (multipart) |

### Chat (`/chat`)

Chat conversacional potenciado por RAG. El usuario selecciona documentos como contexto y el sistema genera respuestas basadas en el contenido documental usando Ollama.

### Quizzes (`/quizzes/generate`)

Generación automática de cuestionarios a partir de documentos. El usuario selecciona un documento y el sistema genera preguntas de distintos tipos (multiple choice, verdadero/falso, etc.).

### Error (`/error/*`)

| Ruta | Tipo |
|---|---|
| `/error` | Error genérico |
| `/error/404` | Página no encontrada |
| `/error/500` | Error del servidor |

---

## Componentes Compartidos

Componentes reutilizables en `shared/components/`:

| Componente | Descripción |
|---|---|
| `AuthIllustrationComponent` | Ilustración SVG decorativa para páginas de autenticación |
| `DocumentSelectorComponent` | Selector de documentos para elegir contexto en chat/quizzes |
| `FabMenuComponent` | Botón flotante de acción con menú desplegable |
| `HeroSectionComponent` | Sección hero reutilizable con título y subtítulo |
| `ProfileEditDialogComponent` | Diálogo modal para editar datos del perfil |
| `ProfileViewDialogComponent` | Diálogo modal para visualizar el perfil |
| `SkeletonLoaderComponent` | Placeholder animado durante carga de datos |
| `SocialLoginButtonsComponent` | Botones de login social (Google, GitHub) |
| `ThemeToggleComponent` | Toggle para cambiar entre modo oscuro y claro |

---

## Servicios

### Core Services (`core/services/`)

| Servicio | Responsabilidad |
|---|---|
| `AuthService` | Login, registro, verificación, gestión de tokens JWT, refresh |
| `ChatService` | Envío de mensajes al chat RAG, CRUD de conversaciones |
| `DocumentService` | Subida, listado y eliminación de documentos |
| `QuizService` | Generación y recuperación de quizzes |

### Shared Services (`shared/services/`)

| Servicio | Responsabilidad |
|---|---|
| `DialogService` | Estado de apertura/cierre de diálogos de perfil |
| `StorageService` | Abstracción de `localStorage` compatible con SSR |
| `ThemeService` | Gestión de tema oscuro/claro con persistencia |
| `ToastService` | Wrapper de `MessageService` de PrimeNG para notificaciones |

Todos los servicios son singleton (`providedIn: 'root'`) e inyectados con la función `inject()`.

---

## Routing y Navegacion

### Mapa de rutas

```
/                           → redirect /dashboard
│
├── /auth                   [Público]
│   ├── /login              → LoginComponent
│   ├── /register           → RegisterComponent
│   ├── /verify             → VerifyComponent
│   └── /exchange           → ExchangeComponent
│
├── /dashboard              [authGuard] → DashboardComponent
├── /documents              [authGuard] → DocumentsComponent
├── /chat                   [authGuard] → ChatComponent
├── /quizzes/generate       [authGuard] → GenerateComponent
│
├── /error                  → ErrorPageComponent (genérico)
├── /error/404              → ErrorPageComponent (404)
├── /error/500              → ErrorPageComponent (500)
└── /**                     → redirect /error/404
```

Todas las features se cargan con **lazy loading** mediante `loadComponent()`, reduciendo el bundle inicial.

### Presupuesto de tamaño

| Tipo | Advertencia | Error |
|---|---|---|
| Bundle inicial | 700 KB | 1.5 MB |

---

## Estado y Signals

La gestión de estado utiliza **@ngrx/signals** (Signal Stores), que reemplaza el boilerplate de NgRx tradicional con una API basada en Signals de Angular:

```typescript
// Ejemplo conceptual de Signal Store
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ user: null, isAuthenticated: false }),
  withComputed(({ user }) => ({
    displayName: computed(() => user()?.name ?? 'Guest')
  })),
  withMethods(({ ... }) => ({
    login(credentials: LoginRequest) { ... },
    logout() { ... }
  }))
);
```

### Flujo de datos

```
User Action → Component → Store Method → Service (HTTP) → API Backend
                 ↑                                            │
                 └──── Signal Update ◄── Store State ◄────────┘
```

---

## Interceptors y Guards

### HTTP Interceptors (funcionales)

| Interceptor | Función |
|---|---|
| `authInterceptor` | Añade `Authorization: Bearer <token>` a todas las peticiones HTTP |
| `errorInterceptor` | Captura errores HTTP globales (401 → redirect login, 500 → toast error) |

### Route Guards (funcionales)

| Guard | Función |
|---|---|
| `authGuard` | Verifica autenticación y token no expirado. Redirige a `/auth/login` con `returnUrl` |

---

## Sistema de Diseno

### Variables CSS

El sistema de diseño está definido en `shared/styles/_design-system.scss` con CSS custom properties:

#### Colores

| Variable | Valor | Uso |
|---|---|---|
| `--primary-color` | `#4f46e5` (Indigo) | Acciones principales, enlaces |
| `--primary-hover` | `#4338ca` | Estado hover de primarios |
| `--success-color` | `#10b981` | Confirmaciones, estados exitosos |
| `--warning-color` | `#f59e0b` | Advertencias |
| `--error-color` | `#ef4444` | Errores, validaciones fallidas |
| `--info-color` | `#3b82f6` | Información contextual |

#### Tipografía

| Variable | Valor |
|---|---|
| `--text-xs` | 0.75rem |
| `--text-sm` | 0.875rem |
| `--text-base` | 1rem |
| `--text-lg` | 1.125rem |
| `--text-xl` | 1.25rem |
| `--text-2xl` | 1.5rem |

#### Espaciado

| Variable | Valor |
|---|---|
| `--spacing-xs` | 4px |
| `--spacing-sm` | 8px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 24px |
| `--spacing-xl` | 32px |
| `--spacing-2xl` | 48px |
| `--spacing-3xl` | 64px |
| `--spacing-4xl` | 96px |

### Tema oscuro

El modo oscuro se activa con la clase `.dark-theme` en el `<body>`, gestionado por `ThemeService` con persistencia en `localStorage`. Las transiciones entre temas son suaves (CSS transitions).

### PrimeNG

Tema base: **Aura Light Green**, configurado en `styles.scss` con overrides CSS para coherencia con el sistema de diseño propio.

---

## Testing

### Framework: Vitest 3.1.1

Configurado via `@angular/build:unit-test` con jsdom como entorno de DOM.

### Cobertura de tests (39 ficheros)

```
Core (7 tests)
├── auth.spec.ts                        # AuthService
├── chat.spec.ts                        # ChatService
├── document.spec.ts                    # DocumentService
├── quiz.spec.ts                        # QuizService
├── auth.guard.spec.ts                  # authGuard
├── auth.interceptor.spec.ts            # authInterceptor
└── error.interceptor.spec.ts           # errorInterceptor

Features (10 tests)
├── login.spec.ts                       # LoginComponent
├── register.spec.ts                    # RegisterComponent
├── verify.spec.ts                      # VerifyComponent
├── exchange.spec.ts                    # ExchangeComponent
├── dashboard.spec.ts                   # DashboardComponent
├── documents.spec.ts                   # DocumentsComponent
├── upload.spec.ts                      # UploadComponent (redirige)
├── chat.spec.ts                        # ChatComponent
├── generate.spec.ts                    # GenerateComponent
└── error-page.spec.ts                  # ErrorPageComponent

Shared Components (10 tests)
├── auth-illustration.component.spec.ts
├── document-selector.spec.ts
├── fab-menu.spec.ts
├── hero-section.spec.ts
├── profile-edit-dialog.spec.ts
├── profile-view-dialog.spec.ts
├── skeleton-loader.spec.ts
├── skeleton-activity-item.spec.ts
├── social-login-buttons.spec.ts
└── theme-toggle.spec.ts

Shared Services (4 tests)
├── storage.service.spec.ts
├── theme.service.spec.ts
├── toast.service.spec.ts
└── dialog.spec.ts

Layout (2 tests)
├── header.spec.ts
└── sidebar.spec.ts

Validators, Pipes y Utils (6 tests)
├── password-match.validator.spec.ts
├── document-icon.pipe.spec.ts
├── file.utils.spec.ts
├── date.utils.spec.ts
├── selection.utils.spec.ts
└── app.spec.ts
```

### Ejecución

```bash
npm test              # Ejecutar todos los tests
```

---

## Build y Ejecucion

### Prerequisitos

- Node.js 20+
- npm 10+

### Comandos

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4200)
npm start

# Build de producción (con SSR)
npm run build

# Servir build SSR
npm run serve:ssr:LeAIrning-front-app

# Build en modo watch (desarrollo)
npm run watch

# Ejecutar tests
npm test
```

### Output de build

Los artefactos se generan en `dist/LeAIrning-front-app/` con bundle del navegador y bundle del servidor SSR.

---

## Configuracion

### Entornos

**Desarrollo** (`environment.ts`):

```typescript
{
  production: false,
  apiUrl: 'http://localhost:8080',
  oauth: {
    google: 'http://localhost:8080/oauth2/authorization/google',
    github: 'http://localhost:8080/oauth2/authorization/github'
  }
}
```

**Producción** (`environment.prod.ts`):

```typescript
{
  production: true,
  apiUrl: 'https://api.leairning.com',
  oauth: {
    google: 'https://api.leairning.com/oauth2/authorization/google',
    github: 'https://api.leairning.com/oauth2/authorization/github'
  }
}
```

### TypeScript Strict Mode

```json
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true
}
```

---

<p align="center">
  Angular 20 · TypeScript 5.9.2 · PrimeNG 20 · @ngrx/signals 20.1
</p>
