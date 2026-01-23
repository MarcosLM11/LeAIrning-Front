# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **LeAIrning Platform Frontend** - an Angular 20 web application that provides a modern UI for an AI-powered learning platform. The application allows users to upload documents, extract content from YouTube/web, chat with AI using RAG, and generate summaries, podcasts, and quizzes.

This frontend connects to a microservices backend architecture through an API Gateway at `http://localhost:8080`.

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

### API Gateway

All API calls go through the API Gateway at `http://localhost:8080`.

### Microservices Mapping

| Feature | Backend Service | Port | API Base Path |
|---------|----------------|------|---------------|
| Auth | auth-service | 8082 | `/api/v1/auth` |
| Users | users-service | 8083 | `/api/v1/users` |
| Workspaces | workspace-service | 8085 | `/api/v1/workspaces` |
| Documents | documents-service | 8084 | `/api/v1/documents` |
| Chat | chat-service | 8089 | `/api/v1/chat` |
| Summaries | summary-service | 8090 | `/api/v1/summaries` |
| Podcasts | podcast-service | 8091 | `/api/v1/podcasts` |
| Quizzes | quiz-service | 8092 | `/api/v1/quizzes` |
| Visualizations | visualization-service | 8093 | `/api/v1/visualizations` |
| Search | search-service | 8095 | `/api/v1/search` |

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

**IMPORTANT**: This project uses a **non-standard naming convention** for components and services. Files DO NOT use the `.component.ts` or `.service.ts` suffixes:

- **Components**: `kebab-case.ts` (e.g., `workspace-list.ts`, `login.ts`, `header.ts`)
  - Template: `kebab-case.html` (e.g., `workspace-list.html`)
  - Styles: `kebab-case.scss` (e.g., `workspace-list.scss`)
  - Tests: `kebab-case.spec.ts` (e.g., `workspace-list.spec.ts`)
- **Services**: `kebab-case.ts` (e.g., `workspace.ts`, `auth.ts`)
  - Tests: `kebab-case.spec.ts` (e.g., `workspace.spec.ts`, `auth.spec.ts`)
- **Guards**: `kebab-case.guard.ts` (e.g., `auth.guard.ts`)
- **Interceptors**: `kebab-case.interceptor.ts` (e.g., `auth.interceptor.ts`)
- **Models**: `kebab-case.model.ts` (e.g., `auth.model.ts`)
- **Validators**: `kebab-case.validator.ts` (e.g., `password-match.validator.ts`)

**Note**: When using Angular CLI generators, you'll need to rename the generated files to match this convention by removing the `.component` or `.service` suffix.

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
  standalone: true,
  imports: [CommonModule, ...],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss'
})
export class FeatureNameComponent {
  // 1. Dependency Injection
  private store = inject(WorkspaceStore);
  private router = inject(Router);

  // 2. Signals (state)
  isOpen = signal(false);
  selectedId = signal<string | null>(null);

  // 3. Computed signals
  count = computed(() => this.store.items().length);

  // 4. Lifecycle hooks
  ngOnInit() { }
  ngOnDestroy() { }

  // 5. Public methods (template interactions)
  handleClick() { }
  onSubmit() { }

  // 6. Private methods
  private loadData() { }
}
```

### Smart vs Dumb Components

**Smart Components (Containers)**:
- Inject stores and services
- Handle business logic
- Manage routing and navigation
- Located in `pages/` directories

**Dumb Components (Presentational)**:
- Receive data via `@Input()`
- Emit events via `@Output()`
- No dependency injection (except utilities)
- Located in `components/` directories

### Signal Store Pattern

```typescript
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';

interface MyState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

export const MyStore = signalStore(
  { providedIn: 'root' },
  withState<MyState>({ items: [], isLoading: false, error: null }),
  withComputed((store) => ({
    itemCount: computed(() => store.items().length)
  })),
  withMethods((store, api = inject(MyApiService)) => ({
    async load() {
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(api.getAll());
        patchState(store, { items, isLoading: false });
      } catch (error) {
        patchState(store, { error: error.message, isLoading: false });
      }
    }
  }))
);
```

### Template Syntax

Use modern Angular template syntax:

```html
<!-- Control flow -->
@if (isLoading()) {
  <app-loading-spinner />
} @else if (error()) {
  <app-error-message [error]="error()" />
} @else {
  <div>Content</div>
}

<!-- Loops -->
@for (item of items(); track item.id) {
  <app-item-card [item]="item" />
} @empty {
  <app-empty-state />
}

<!-- Switch -->
@switch (status()) {
  @case ('loading') { <app-spinner /> }
  @case ('error') { <app-error /> }
  @default { <app-content /> }
}
```

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

- Component tests: `*.component.spec.ts`
- Service tests: `*.service.spec.ts`
- Guard tests: `*.guard.spec.ts`

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (if configured)
npm test -- --watch
```

## Common Patterns

### Lazy Loading Routes

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'workspaces',
    loadChildren: () => import('./features/workspaces/workspaces.routes')
      .then(m => m.WORKSPACE_ROUTES)
  }
];

// features/workspaces/workspaces.routes.ts
export const WORKSPACE_ROUTES: Routes = [
  { path: '', component: WorkspaceListComponent },
  { path: ':id', component: WorkspaceDetailComponent }
];
```

### HTTP Error Handling

```typescript
// Error interceptor handles global exceptions
// For feature-specific exceptions, use try-catch in stores:

async loadData() {
  patchState(store, { isLoading: true, error: null });
  try {
    const data = await firstValueFrom(this.api.get());
    patchState(store, { data, isLoading: false });
  } catch (error) {
    patchState(store, {
      error: error instanceof Error ? error.message : 'Unknown error',
      isLoading: false
    });
    throw error; // Re-throw if component needs to handle it
  }
}
```

### Form Handling

```typescript
// Reactive forms pattern
export class LoginComponent {
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();
      // Handle submission
    }
  }
}
```

### WebSocket Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class ChatWebSocketService {
  private socket?: WebSocket;
  private messagesSubject = new Subject<ChatMessage>();

  messages$ = this.messagesSubject.asObservable();

  connect(workspaceId: string) {
    this.socket = new WebSocket(`ws://localhost:8080/chat/${workspaceId}/stream`);
    this.socket.onmessage = (event) => {
      this.messagesSubject.next(JSON.parse(event.data));
    };
  }

  disconnect() {
    this.socket?.close();
  }
}
```

## Development Workflow

### Creating a New Feature

1. Generate feature directory structure:
   ```bash
   mkdir -p src/app/features/my-feature/{pages,components,services,store}
   ```

2. Create route file: `my-feature.routes.ts`

3. Create store: `store/my-feature.store.ts`

4. Create API service: `services/my-feature-api.service.ts`

5. Create page components in `pages/`

6. Create presentational components in `components/`

7. Add lazy route in `app.routes.ts`

### Adding a New Component

```bash
# Using Angular CLI
npm run ng -- generate component features/workspaces/components/workspace-card --standalone

# Manual creation
# Create: workspace-card.component.ts, .html, .scss
```

### Adding a New Service

```bash
# Using Angular CLI
npm run ng -- generate service features/workspaces/services/workspace-api

# Manual creation
# Create: workspace-api.service.ts with @Injectable({ providedIn: 'root' })
```

## Build and Deployment

### Production Build

```bash
npm run build
```

Build artifacts are stored in `dist/LeAIrning-front-app/`.

### Build Budgets

The application has bundle size budgets configured:
- Initial bundle: max 500kB (warning), 1MB (error)
- Component styles: max 4kB (warning), 8kB (error)

### SSR Build

SSR is enabled by default. The production build includes both browser and server bundles.

## Project-Specific Rules

### Authentication Flow

1. User logs in via `AuthService`
2. JWT tokens stored in `AuthStore`
3. `authInterceptor` adds token to all HTTP requests
4. `authGuard` protects routes requiring authentication
5. On 401 error, `errorInterceptor` redirects to login

### Document Upload Flow

1. User selects file in `DocumentUploadComponent`
2. File uploaded to documents-service via `DocumentApiService`
3. Upload progress tracked in `DocumentStore`
4. Processing status polled until completion
5. Document added to workspace via `WorkspaceStore`

### Chat Flow

1. User opens chat in workspace
2. `ChatWebSocketService` establishes WebSocket connection
3. User sends message via HTTP POST
4. AI response streamed via WebSocket
5. Messages stored in `ChatStore`
6. Source citations displayed in `SourceCitationComponent`

## Code Quality

### EditorConfig

The project uses EditorConfig:
- 2 spaces for indentation
- UTF-8 encoding
- Single quotes for TypeScript
- Trim trailing whitespace

### Prettier (Optional)

Prettier is configured in package.json:
- Print width: 100
- Single quotes: true
- Angular parser for HTML

## Related Documentation

- **Frontend Implementation Plan**: See `FRONTEND_IMPLEMENTATION_PLAN.md` for detailed architecture and roadmap
- **Backend Architecture**: Refer to backend repositories for microservices documentation
- **Angular Docs**: https://angular.dev
- **PrimeNG Docs**: https://primeng.org
- **@ngrx/signals**: https://ngrx.io/guide/signals
