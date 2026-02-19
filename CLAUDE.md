# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **LeAIrning Platform Frontend** - an Angular 20 web application that provides a modern UI for an AI-powered learning platform. The application allows users to upload documents, extract content from YouTube/web, chat with AI using RAG, and generate summaries, podcasts, and quizzes.

This frontend connects to a Spring Boot monolith backend at `http://localhost:8080`.

## Technology Stack

- **Angular 20.0.0** - Latest Angular with standalone components
- **TypeScript 5.9.2** - Strict mode enabled
- **PrimeNG 20.0.0** - UI component library
- **@ngrx/signals 20.1.0** - State management using signals
- **Angular SSR** - Server-side rendering enabled
- **RxJS 7.8** - Reactive programming
- **Vitest 3.1.1** - Testing framework
- **Express 5.1.0** - SSR server
- **esbuild** - Fast build system via `@angular/build:application`

## Development Commands

### Starting the Development Server

```bash
# Start dev server (default: http://localhost:4200)
npm start
# or
npm run start
```

### Building

```bash
# Production build
npm run build

# Development build with watch mode
npm run watch
```

### Testing

```bash
# Run tests with Vitest
npm test
# or
npm run test
```

### SSR (Server-Side Rendering)

```bash
# Build for SSR
npm run build

# Serve SSR build
npm run serve:ssr:LeAIrning-front-app
```

### Running with Angular CLI

```bash
# Use Angular CLI directly
npm run ng -- <command>

# Examples:
npm run ng -- generate component features/auth/pages/login
npm run ng -- generate service core/auth/services/auth
```

## Architecture

### Standalone Components Architecture

This project uses Angular's **standalone components** pattern (no NgModules). All components are self-contained with explicit imports.

### Hexagonal Architecture (Ports & Adapters)

The application follows a feature-based structure inspired by hexagonal architecture:

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── api/                # API configuration and base services
│   └── auth/               # Authentication system
│       ├── guards/         # Route guards
│       ├── interceptors/   # HTTP interceptors
│       └── services/       # Auth services
├── features/               # Feature modules (lazy-loaded)
│   ├── auth/              # Login, register, forgot password
│   ├── workspaces/        # Workspace management
│   ├── documents/         # Document upload/management
│   ├── chat/              # Chat with AI (RAG)
│   ├── summaries/         # Summary generation
│   ├── podcasts/          # Podcast generation/playback
│   ├── quizzes/           # Quiz generation/taking
│   └── dashboard/         # Main dashboard
├── shared/                 # Reusable components, pipes, directives
│   ├── components/        # Common UI components
│   └── models/            # TypeScript interfaces/types
└── layout/                 # App shell (header, sidebar, layouts)
```

### Feature Structure Pattern

Each feature follows this consistent structure:

```
features/<feature-name>/
├── pages/              # Smart components (containers)
├── components/         # Dumb components (presentational)
├── services/           # Feature-specific API services
├── store/              # Signal store for state management
└── <feature>.routes.ts # Lazy-loaded routes
```

### State Management with @ngrx/signals

State is managed using **Signal Stores** from `@ngrx/signals`. Each feature has its own store:

- `AuthStore` - Authentication state (user, tokens)
- `WorkspaceStore` - Workspace management
- `DocumentStore` - Document upload/management
- `ChatStore` - Chat messages and streaming state

Signal stores provide reactive state management without the boilerplate of traditional NgRx.

## Backend Integration

All API calls go to the Spring Boot monolith at `http://localhost:8080`. API paths follow the pattern `/api/v1/<resource>` (e.g., `/api/v1/auth`, `/api/v1/users`, `/api/v1/documents`, `/api/v1/chat`).

### HTTP Interceptors

The application uses functional HTTP interceptors (Angular 14+ style):

- **authInterceptor** - Adds JWT Bearer token to requests
- **errorInterceptor** - Global error handling and user notifications

### WebSocket Support

Real-time features use WebSocket connections:
- Chat streaming responses
- Real-time notifications
- Document processing status updates

## Code Patterns & Conventions

### File Naming

**IMPORTANT**: This project uses a **non-standard naming convention** for components and services. New files should NOT use the `.component.ts` or `.service.ts` suffixes:

- **Components**: `kebab-case.ts` (e.g., `login.ts`, `header.ts`)
  - Template: `kebab-case.html` / Styles: `kebab-case.scss` / Tests: `kebab-case.spec.ts`
- **Services**: `kebab-case.ts` (e.g., `auth.ts`, `document.ts`)
  - Tests: `kebab-case.spec.ts`
- **Guards**: `kebab-case.guard.ts` / **Interceptors**: `kebab-case.interceptor.ts`
- **Models**: `kebab-case.model.ts` / **Validators**: `kebab-case.validator.ts`

**Note**: Some legacy files still use `.component.ts` / `.service.ts` suffixes (e.g., `auth-illustration.component.ts`, `theme.service.ts`). New files should follow the suffix-free convention. When using Angular CLI generators, rename generated files to remove the `.component` or `.service` suffix.

### TypeScript Conventions

- **Classes**: `PascalCase` (e.g., `WorkspaceListComponent`)
- **Interfaces/Types**: `PascalCase` (e.g., `Workspace`, `CreateWorkspaceDto`)
- **Variables/Methods**: `camelCase` (e.g., `loadWorkspaces()`, `isLoading`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `DEFAULT_PAGE_SIZE`)
- **Private fields**: prefix with `private` keyword (e.g., `private http = inject(HttpClient)`)

### Component Structure

Components should follow this order:

```typescript
import { Component, inject, signal, computed } from '@angular/core';

@Component({
  selector: 'app-feature-name',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ...],
  templateUrl: './feature-name.html',
  styleUrl: './feature-name.scss'
})
export class FeatureNameComponent {
  // 1. Dependency Injection
  // 2. Signals (state)
  // 3. Computed signals
  // 4. Lifecycle hooks
  // 5. Public methods (template interactions)
  // 6. Private methods
}
```

### Smart vs Dumb Components

- **Smart (Containers)** in `pages/`: inject stores/services, handle business logic
- **Dumb (Presentational)** in `components/`: receive data via `input()`, emit via `output()`

## PrimeNG Configuration

### Theme

The application uses PrimeNG's **Aura Light Green** theme, configured in `src/styles.scss`.

### Common PrimeNG Components Used

- **p-button** - Buttons with various styles
- **p-card** - Card containers
- **p-dialog** - Modal dialogs
- **p-table** - Data tables
- **p-toast** - Notification toasts
- **p-progressSpinner** - Loading spinners
- **p-fileUpload** - File upload component
- **p-menu** - Navigation menus
- **p-inputText** - Text inputs
- **p-dropdown** - Dropdown selects

### PrimeNG Services

PrimeNG services are provided in `app.config.ts`:
- `MessageService` - For toast notifications
- `ConfirmationService` - For confirmation dialogs

## TypeScript Configuration

### Strict Mode

The project uses TypeScript strict mode with these enabled:
- `strict: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `strictInjectionParameters: true`
- `strictInputAccessModifiers: true`
- `strictTemplates: true`

Always write type-safe code with explicit types.

### Path Aliases

No path aliases are currently configured. Use relative imports:

```typescript
// ✅ Correct
import { WorkspaceStore } from '../store/workspace.store';
import { Workspace } from '../../shared/models/workspace.model';

// ❌ Avoid (not configured)
import { WorkspaceStore } from '@features/workspaces/store/workspace.store';
```

## Testing

### Test Framework

The project uses **Vitest** as the test runner (configured via `@angular/build:unit-test`).

### Test File Naming

Tests follow the same suffix-free convention as source files:
- `login.spec.ts`, `auth.spec.ts`, `sidebar.spec.ts`, etc.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (if configured)
npm test -- --watch
```

## Build and Deployment

Build artifacts are stored in `dist/LeAIrning-front-app/`. SSR is enabled by default.

## Project-Specific Rules

### Authentication Flow

1. User logs in via `AuthService`
2. JWT tokens stored in `AuthStore`
3. `authInterceptor` adds token to all HTTP requests
4. `authGuard` protects routes requiring authentication
5. On 401 error, `errorInterceptor` redirects to login

## Code Quality

- EditorConfig: 2 spaces, UTF-8, single quotes, trim trailing whitespace
- Prettier (optional): print width 100, single quotes, Angular parser for HTML
