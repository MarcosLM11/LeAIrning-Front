# AGENTS.md

Guidance for AI coding agents working in this Angular 20 repository.

## Build/Lint/Test Commands

```bash
# Development
npm start                    # Dev server at http://localhost:4200
npm run watch                # Build with watch mode

# Production
npm run build                # Production build (outputs to dist/)
npm run serve:ssr:LeAIrning-front-app  # Serve SSR build

# Testing (Vitest)
npm test                     # Run all tests
npm test -- --testNamePattern="should create"  # Run tests matching pattern
npm test -- src/app/features/auth/pages/login/login.spec.ts  # Run single file
npm test -- --watch          # Watch mode
```

## Project Structure

```
src/app/
├── core/                    # Singleton services, guards, interceptors, models
│   ├── auth/guards/         # Route guards (auth.guard.ts)
│   ├── interceptors/        # HTTP interceptors (auth.interceptor.ts)
│   ├── models/              # TypeScript interfaces
│   └── services/            # Core services
├── features/                # Feature modules (lazy-loaded)
│   ├── auth/pages/          # Login, register pages
│   └── dashboard/pages/     # Dashboard pages
├── layout/                  # App shell (header, sidebar)
└── shared/                  # Reusable components, services, styles
    ├── components/          # Shared UI components
    ├── services/            # Shared services (theme, etc.)
    └── styles/              # Design system SCSS
```

## File Naming Convention (Non-Standard)

**IMPORTANT**: This project does NOT use `.component.ts` or `.service.ts` suffixes.

| Type         | File Name                    | Class/Export Name       |
|--------------|------------------------------|-------------------------|
| Components   | `kebab-case.ts`              | `PascalCase`            |
| Services     | `kebab-case.ts`              | `PascalCaseService`     |
| Guards       | `kebab-case.guard.ts`        | `camelCaseGuard`        |
| Interceptors | `kebab-case.interceptor.ts`  | `camelCaseInterceptor`  |
| Models       | `kebab-case.model.ts`        | `PascalCase` (interface)|
| Validators   | `kebab-case.validator.ts`    | `camelCaseValidator`    |

Examples: `login.ts` exports `Login`, `auth.ts` exports `AuthService`

## Code Style

### Formatting (Prettier + EditorConfig)
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for TypeScript
- **Line width**: 100 characters max
- **Final newline**: Required
- **Trailing whitespace**: Trim

### Imports
- Use relative paths (no path aliases configured)
- Group imports: Angular core > Third-party > Local

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- Avoid `any`; use `unknown` when type is uncertain
- Prefer type inference when obvious
- Use explicit return types for public methods

### Naming
- **Classes/Interfaces**: `PascalCase`
- **Variables/Methods**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private fields**: Use `private` keyword (not `#` prefix)

## Angular Patterns

### Components
```typescript
@Component({
  selector: 'app-feature-name',
  imports: [CommonModule],
  templateUrl: './feature-name.html',
  styleUrl: './feature-name.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureName {
  // 1. Dependency injection
  private service = inject(SomeService);

  // 2. Signals
  isLoading = signal(false);

  // 3. Computed
  count = computed(() => this.items().length);

  // 4. Inputs/Outputs
  item = input.required<Item>();
  selected = output<Item>();

  // 5. Lifecycle hooks
  // 6. Public methods
  // 7. Private methods
}
```

### Key Rules
- **Standalone components**: Do NOT set `standalone: true` (default in Angular 20+)
- **Signals**: Use `signal()`, `computed()`, `input()`, `output()`
- **DI**: Use `inject()` function, not constructor injection
- **Change detection**: Always use `OnPush`
- **Host bindings**: Use `host` object in decorator, not `@HostBinding`/`@HostListener`
- **Images**: Use `NgOptimizedImage` for static images
- **Forms**: Prefer Reactive forms over Template-driven

### Templates
```html
<!-- Use native control flow -->
@if (isLoading()) {
  <app-spinner />
} @else {
  @for (item of items(); track item.id) {
    <app-card [item]="item" />
  } @empty {
    <p>No items</p>
  }
}
```

- Do NOT use `*ngIf`, `*ngFor`, `*ngSwitch`
- Do NOT use `ngClass`/`ngStyle`; use `[class.name]` and `[style.prop]` bindings
- Do NOT write arrow functions in templates

## State Management

- **Local state**: Use signals (`signal<T>()`)
- **Derived state**: Use `computed()`
- **Signal updates**: Use `.set()` or `.update()`, never `.mutate()`
- **Feature state**: Use `@ngrx/signals` stores when needed

## Services

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private http = inject(HttpClient);

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>('/api/items');
  }
}
```

## Error Handling

```typescript
// In signal stores or components
async loadData() {
  this.isLoading.set(true);
  this.error.set(null);
  try {
    const data = await firstValueFrom(this.api.getData());
    this.data.set(data);
  } catch (err) {
    this.error.set(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    this.isLoading.set(false);
  }
}
```

Global errors are handled by `authInterceptor` (401 redirects) and can use `errorInterceptor`.

## SSR Considerations

Always guard browser-only APIs:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

private platformId = inject(PLATFORM_ID);

ngOnInit() {
  if (isPlatformBrowser(this.platformId)) {
    // Safe to use localStorage, window, document
  }
}
```

## Accessibility Requirements

- Must pass all AXE automated checks
- Must meet WCAG AA standards:
  - Proper focus management
  - Color contrast ratios (4.5:1 for text)
  - ARIA attributes where needed
  - Keyboard navigation support

## UI Components (PrimeNG)

Common components: `p-button`, `p-card`, `p-dialog`, `p-table`, `p-toast`, `p-inputText`

```typescript
// Services provided in app.config.ts
import { MessageService } from 'primeng/api';
```

## Backend API

All requests go through API Gateway at `http://localhost:8080`.
Auth tokens are automatically attached by `authInterceptor`.


## La Pirámide de Testing

  /\
  /E2E\ ← Pocas (5-10%)
  /____\
  / \
  /Integr. \ ← Moderadas (20-30%)
  /__________\
  / \
  / Unit Tests \ ← Muchas (60-70%)
  /_______________\

Principio: Más tests unitarios, menos E2E

## Unit Tests: Características

• Rápidas: < 10ms por test
• Aisladas: Sin dependencias externas
• Determinísticas: Mismo input = mismo output
• Fáciles de mantener: Cambios localizados

Cuándo usar: Funciones puras, lógica de negocio, cálculos, validaciones

## Integration Tests: Características

• Moderadamente rápidas: 100-500ms por test
• Conectadas: Múltiples componentes juntos
• Funcionales: Validan flujos de usuario
• UI-centric: Usan DOM real

Cuándo usar: Flujos de usuario, interacciones entre componentes, estados
compartidos

## E2E Tests: Características

• Lentas: 1-10 segundos por test
• Reales: Browser + Network + Backend
• Costosas: Infraestructura compleja
• Críticas: Validan flujos completos

Cuándo usar: Flujos críticos de negocio, validación cross-browser, regresiones

## Vitest: El Runner Moderno

¿Por qué Vitest?
• ⚡ Velocidad: 10x más rápido que Jest
• 🔥 Hot Reload: Tests se re-ejecutan automáticamente
• 📊 Coverage nativo: Sin configuración adicional
• 🎯 ESM First: Soporte nativo para módulos ES

## Testing Library: User-Centric

Philosophy:
“The more your tests resemble the way your software is used, the more confidence
they can give you.”

Query Hierarchy:
1. getByRole - Más semántico
2. getByLabelText - Para formularios
3. getByText - Para contenido visible
4. getByTestId - Último recurso

Tipos de queries:
• getBy* :  Encuentra elemento, falla si no existe (assertions)
• queryBy* : Encuentra elemento, retorna null si no existe (verificar ausencia)
• findBy* : Encuentra elemento async, espera hasta que aparezca (loading)

Ejemplo:
// Usuario ve botón por su texto
screen.getByRole('button', { name: /add to cart/i })
// Usuario ve input por su label
screen.getByLabelText('Email')
// Verificar elemento NO existe
expect(screen.queryByText('Error')).toBeNull()


## Playwright: E2E de Nueva Generación

Ventajas:
• 🚀 3x más rápido que Selenium
• 🎭 Multi-browser automático
• 📱 Emulación de dispositivos móviles
• 🎥 Auto-screenshots y videos
• 🔍 Auto-wait inteligente


## Métricas de Coverage (Obligatorio de cumplir):

Functions: % de funciones ejecutadas
Lines: % de líneas de código ejecutadas
Branches: % de caminos en condicionales
Statements: % de declaraciones ejecutadas

coverage: {
  thresholds: {
    global: {
      functions: 100, // Todas las funciones
      lines: 80, // 80% líneas
      branches: 80, // 80% branches
      statements: 80 // 80% statements
    }
  }
}

## Métricas de Éxito en testing:

Cuantitativas (medibles):
• Coverage: Functions 100%, Lines 80%+
• Velocidad: Unit < 10ms, Integration < 500ms
Cualitativas (perceptibles):
• Confianza para refactorizar
• Tests como documentación viviente
• Retroalimentación rápida (< 30s)


## Métricas de TDD (Obligatorio de cumplir, ya que es la filosofía de desarrollo que hay que seguir.)

Las Tres Leyes de TDD
1. No escribas código de producción hasta tener un test que falle
2. No escribas más test del necesario para fallar
3. No escribas más código del necesario para pasar el test
Disciplina, no solo técnica

Cuantitativas (medibles):
• Test First: 95%+ código después de test
• Coverage: 95%+ es típico en TDD
• Defect Rate (tasa de defectos): 40-80% menos bugs

Cualitativas (perceptibles):
• 🎯 Mejor diseño emergente
• 📖 Documentación viviente
• 🛡 Refactoring sin miedo
• ⚡ Retroalimentación rápida

Ciclo TDD:
• 🔴 RED: Escribe test que falle
• 🟢 GREEN: Código mínimo para pasar
• ♻ REFACTOR: Mejora sin romper tests

Puntos Clave
1. Test First: Siempre test antes que código
2. Red-Green-Refactor: El ciclo sagrado de TDD
3. Asistencia IA: Acelera generación de tests
4. Diseño: TDD mejora arquitectura emergente
5. Funciones Puras: TDD favorece funciones puras
6. Documentación Viviente: Tests como especificación ejecutable