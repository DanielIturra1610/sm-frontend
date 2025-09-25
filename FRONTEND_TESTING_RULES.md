# Frontend Testing Architecture Rules - Stegmaier Management

## 🧪 REGLAS ESTRICTAS DE TESTING

### 1. Hierarchical Test Organization Rule (OBLIGATORIO)

**"Los tests deben reflejar exactamente la estructura del código"**

#### Estructura Obligatoria:
```
src/
├── app/
│   ├── __tests__/
│   │   ├── landing_page/
│   │   │   ├── hero_section/
│   │   │   │   ├── hero_section.test.tsx
│   │   │   │   ├── hero_section.integration.test.tsx
│   │   │   │   └── hero_section.e2e.test.tsx
│   │   │   ├── features_section/
│   │   │   │   └── features_section.test.tsx
│   │   │   └── stats_section/
│   │   │       └── stats_section.test.tsx
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login_form.test.tsx
│   │   │   │   └── login_page.test.tsx
│   │   │   └── register/
│   │   │       ├── register_form.test.tsx
│   │   │       └── register_page.test.tsx
│   │   ├── dashboard/
│   │   │   ├── incidents/
│   │   │   │   ├── incident_list/
│   │   │   │   │   └── incident_list.test.tsx
│   │   │   │   ├── incident_form/
│   │   │   │   │   └── incident_form.test.tsx
│   │   │   │   └── incident_detail/
│   │   │   │       └── incident_detail.test.tsx
│   │   │   ├── companies/
│   │   │   │   ├── company_list/
│   │   │   │   └── company_form/
│   │   │   ├── documents/
│   │   │   └── analysis/
│   │   │       ├── five_whys/
│   │   │       └── fishbone/
│   │   └── api/
│   │       ├── auth/
│   │       ├── incidents/
│   │       └── companies/
├── shared/
│   ├── __tests__/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── button/
│   │   │   │   ├── form/
│   │   │   │   └── table/
│   │   │   ├── forms/
│   │   │   ├── charts/
│   │   │   └── tables/
│   │   ├── hooks/
│   │   │   ├── api/
│   │   │   │   ├── use_api.test.tsx
│   │   │   │   └── use_mutations.test.tsx
│   │   │   └── tenant/
│   │   │       └── use_tenant.test.tsx
│   │   └── types/
│   │       └── api_types.test.tsx
└── lib/
    ├── __tests__/
    │   ├── api/
    │   │   └── api_client.test.tsx
    │   ├── auth/
    │   │   └── auth_utils.test.tsx
    │   └── utils/
    │       └── general_utils.test.tsx
```

#### Nomenclatura Obligatoria:
- **Unit Tests**: `component_name.test.tsx`
- **Integration Tests**: `component_name.integration.test.tsx`
- **E2E Tests**: `component_name.e2e.test.tsx`
- **Hook Tests**: `hook_name.test.tsx`
- **API Tests**: `api_feature.test.tsx`

### 2. TDD Cycle Rule (OBLIGATORIO)

**Cada componente DEBE seguir el ciclo Red-Green-Refactor:**

1. **🔴 RED**: Escribir test que falle
2. **🟢 GREEN**: Implementar código mínimo para pasar
3. **🔵 REFACTOR**: Mejorar sin romper tests

### 3. Test Coverage Rules (OBLIGATORIO)

#### Por Tipo de Componente:

**Landing Page Components:**
- ✅ Content and Structure
- ✅ Visual Design and Styling
- ✅ Accessibility (WCAG compliance)
- ✅ Responsive Design
- ✅ Content Quality
- ✅ Business Goals Alignment

**Dashboard Components:**
- ✅ Data Loading States
- ✅ Error Handling
- ✅ User Interactions
- ✅ API Integration
- ✅ Multi-tenant Context
- ✅ Permission Validation

**Form Components:**
- ✅ Field Validation
- ✅ Submission Handling
- ✅ Error Display
- ✅ Loading States
- ✅ Accessibility
- ✅ Data Persistence

**API Integration:**
- ✅ Success Responses
- ✅ Error Responses
- ✅ Network Failures
- ✅ Authentication
- ✅ Multi-tenant Headers
- ✅ Retry Logic

### 4. Testing Technologies Stack

#### Core Testing:
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Cypress**: E2E testing
- **MSW**: API mocking

#### Additional Tools:
- **@testing-library/jest-dom**: Custom matchers
- **@testing-library/user-event**: User interactions
- **jest-environment-jsdom**: Browser environment

### 5. Test File Organization Rules

#### File Header Template:
```typescript
/**
 * [ComponentName] Component Tests
 * TDD: [Red|Green|Refactor] phase - [Description]
 *
 * @feature [FeatureName]
 * @component [ComponentPath]
 * @coverage [unit|integration|e2e]
 */
```

#### Test Structure Template:
```typescript
describe('[ComponentName] Component', () => {
  describe('Core Functionality', () => {
    // Main feature tests
  })

  describe('Error Handling', () => {
    // Error state tests
  })

  describe('User Interactions', () => {
    // User event tests
  })

  describe('Accessibility', () => {
    // A11y tests
  })

  describe('Performance', () => {
    // Performance tests if needed
  })
})
```

### 6. Mock and Fixture Rules

#### API Mocking:
```
src/app/__tests__/__mocks__/
├── api/
│   ├── auth_responses.ts
│   ├── incident_responses.ts
│   └── company_responses.ts
├── fixtures/
│   ├── users.ts
│   ├── incidents.ts
│   └── companies.ts
└── handlers/
    ├── auth_handlers.ts
    ├── incident_handlers.ts
    └── company_handlers.ts
```

### 7. Continuous Testing Rules

#### Pre-commit:
- ✅ All tests must pass
- ✅ Coverage thresholds met
- ✅ No test files skipped

#### Build Pipeline:
- ✅ Unit tests
- ✅ Integration tests
- ✅ E2E tests (critical paths)
- ✅ Coverage reporting

### 8. Test Documentation Rules

#### Each test file MUST include:
- **Purpose**: What functionality is being tested
- **Coverage**: What scenarios are covered
- **Dependencies**: What mocks or fixtures are used
- **Maintenance**: When tests should be updated

#### Example Documentation:
```typescript
/**
 * HeroSection Component Tests
 *
 * PURPOSE: Validates landing page hero section functionality
 * COVERAGE: Content, styling, accessibility, responsive design
 * DEPENDENCIES: None (pure component)
 * MAINTENANCE: Update when hero content or CTAs change
 *
 * Test Scenarios:
 * - Content rendering and structure
 * - Call-to-action button functionality
 * - Responsive design behavior
 * - Accessibility compliance
 * - Visual hierarchy validation
 */
```

---

## 🎯 ENFORCEMENT

**Estas reglas son OBLIGATORIAS y serán verificadas en:**
- ✅ Code reviews
- ✅ Automated testing pipeline
- ✅ Build process
- ✅ Pre-commit hooks

**Violaciones resultarán en:**
- ❌ Build failures
- ❌ PR rejections
- ❌ Coverage drops

---

*"Testing is not about finding bugs, it's about designing better software"*