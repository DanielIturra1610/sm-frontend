# Reporte de Archivos y Carpetas No Utilizados

**Fecha**: 24 de diciembre 2024
**Proyecto**: sm-frontend

---

## Resumen Ejecutivo

| Categoría | Cantidad | Confianza |
|-----------|----------|-----------|
| **Servicios no usados** | 3 | ALTA |
| **Componentes no usados** | 3 | ALTA |
| **Assets no usados** | 5 SVGs | ALTA |
| **Rutas duplicadas** | ~6 carpetas | ALTA |
| **Hooks parcialmente usados** | 4 | MEDIA |
| **Páginas deshabilitadas** | ~10 | MEDIA |
| **Esquemas duplicados** | 1 archivo | MEDIA |

---

## 1. SERVICIOS NO UTILIZADOS

### ✅ ELIMINAR - Confianza ALTA

#### `src/lib/api/services/sla-service.ts`
- **Razón**: No hay ninguna referencia a este servicio en el código fuente
- **Evidencia**: Grep no encontró ningún import o referencia directa
- **Estado**: Completamente no utilizado

### ⚠️ REVISAR - Confianza MEDIA

#### `src/lib/api/services/workflow-service.ts`
- **Razón**: No hay imports de este servicio en componentes activos
- **Evidencia**: Las rutas de workflows están comentadas en el sidebar (líneas 71-77)
- **Estado**: Se usa solo en páginas deshabilitadas

#### `src/lib/api/services/document-service.ts`
- **Razón**: No hay imports en la app principal activa
- **Evidencia**: Las rutas están comentadas en el sidebar
- **Estado**: Se usa solo en páginas deshabilitadas

---

## 2. COMPONENTES NO UTILIZADOS

### ✅ ELIMINAR - Confianza ALTA

#### `src/shared/components/ui/sla-badge.tsx`
- **Razón**: El componente está definido pero nunca se importa en ningún archivo
- **Evidencia**: Búsqueda por "SLABadge" solo retorna la definición, no usos

#### `src/shared/components/ui/plgf-badge.tsx`
- **Razón**: El componente está definido pero nunca se importa
- **Evidencia**: Búsqueda por "PLGFBadge" solo retorna la definición, no usos

### ⚠️ REVISAR - Confianza MEDIA

#### `src/shared/components/ui/status-badge.tsx`
- **Razón**: Se importa en solo 2 archivos (incidents/page.tsx e incident-card.tsx)
- **Evidencia**: incident-card.tsx podría no estar siendo utilizado
- **Acción**: Verificar si incident-card.tsx se usa

---

## 3. PÁGINAS DUPLICADAS - ANÁLISIS

### ✅ ELIMINAR - Confianza ALTA

**Directorio completo**: `src/app/(app)/analysis/`

Este directorio es una **duplicación completa** de `/root-cause-analysis`:

| Carpeta Duplicada | Carpeta Activa |
|-------------------|----------------|
| `/analysis/fishbone/` | `/root-cause-analysis/fishbone/` |
| `/analysis/five-whys/` | `/root-cause-analysis/five-whys/` |
| `/analysis/fishbone/page.tsx` | `/root-cause-analysis/fishbone/page.tsx` |
| `/analysis/fishbone/[id]/page.tsx` | `/root-cause-analysis/fishbone/[id]/page.tsx` |
| `/analysis/fishbone/create/page.tsx` | `/root-cause-analysis/fishbone/create/page.tsx` |
| `/analysis/five-whys/page.tsx` | `/root-cause-analysis/five-whys/page.tsx` |
| `/analysis/five-whys/[id]/page.tsx` | `/root-cause-analysis/five-whys/[id]/page.tsx` |
| `/analysis/five-whys/create/page.tsx` | `/root-cause-analysis/five-whys/create/page.tsx` |

**Evidencia**: La navegación en `Sidebar.tsx` (línea 55) apunta SOLO a `/root-cause-analysis`

**Nota**: Las páginas en `/analysis` son accesibles por URL directa pero no desde la navegación de la app.

---

## 4. HOOKS NO UTILIZADOS

### ✅ ELIMINAR - Confianza ALTA

#### `src/shared/hooks/sla-hooks.ts`
- **Razón**: No hay evidencia de uso en ninguna página
- **Evidencia**: Grep no encontró referencias al hook

### ⚠️ REVISAR - Confianza MEDIA

#### `src/shared/hooks/workflow-hooks.ts`
- **Razón**: Se usa pero solo en páginas deshabilitadas (workflows/*)
- **Evidencia**: Importado solo en `/workflows/` que está comentado en navegación
- **Decisión**: Mantener si se planea habilitar workflows

#### `src/shared/hooks/document-hooks.ts`
- **Razón**: Se usa pero solo en páginas deshabilitadas (documents/*)
- **Evidencia**: Importado solo en `/documents/` que está comentado en navegación
- **Decisión**: Mantener si se planea habilitar documents

#### `src/shared/hooks/company-hooks.ts`
- **Razón**: Solo se importa en `create-tenant/page.tsx`
- **Evidencia**: Usado en flow de registro de tenants
- **Decisión**: Probablemente necesario, verificar uso

---

## 5. ASSETS NO UTILIZADOS

### ✅ ELIMINAR - Confianza ALTA

Los siguientes archivos SVG en `/public` NO se referencian en ningún lado del código:

```
public/next.svg
public/vercel.svg
public/file.svg
public/globe.svg
public/window.svg
```

**Evidencia**: Son archivos default de Next.js que nunca se usaron. Solo se usan los logos en `/public/images/`.

---

## 6. ESQUEMAS DE VALIDACIÓN DUPLICADOS

### ⚠️ CONSOLIDAR - Confianza MEDIA

#### `src/lib/validations/schemas.ts`

Este archivo contiene esquemas que están **redefinidos localmente** en los componentes:

| Esquema en schemas.ts | Redefinido en |
|----------------------|---------------|
| `loginSchema` | `src/app/(auth)/login/page.tsx` |
| `registerSchema` | `src/app/(auth)/register/page.tsx` |
| `companySchema` | Componentes de company |

**Recomendación**: Consolidar usando el archivo centralizado o eliminar el archivo si se prefiere esquemas locales.

---

## 7. PÁGINAS DESHABILITADAS INTENCIONALMENTE

### 🔒 MANTENER - Funcionalidad Futura

Las siguientes páginas existen pero están **comentadas en la navegación**:

#### `src/app/(app)/workflows/**`
```
- workflows/page.tsx
- workflows/create/page.tsx
- workflows/[id]/page.tsx
- workflows/tasks/page.tsx
```
**Estado**: Código completo, rutas comentadas en Sidebar.tsx (líneas 71-77)

#### `src/app/(app)/documents/**`
```
- documents/page.tsx
- documents/generate/page.tsx
- documents/[id]/page.tsx
```
**Estado**: Código completo, rutas comentadas en Sidebar.tsx (líneas 65-68)

**Decisión**: Mantener si se planea habilitar estas funcionalidades en el futuro.

---

## 8. ARCHIVOS DE DOCUMENTACIÓN

### 📝 REVISAR - Confianza BAJA

Los siguientes archivos markdown son documentación que podría estar obsoleta:

```
AUDITORIA_BACKEND_COMPLETA.md
AUDITORIA_FRONTEND_COMPLETA.md
DATOS_PRUEBA_SUCESO.md
DATOS_PRUEBA_ARBOL_CAUSAL.md
```

**Decisión**: Revisar si la documentación sigue siendo relevante o moverla a una carpeta `/docs`.

---

## Recomendaciones de Limpieza

### 🟢 Eliminar Sin Riesgo (ALTA confianza)

```bash
# Componentes
rm src/shared/components/ui/sla-badge.tsx
rm src/shared/components/ui/plgf-badge.tsx

# Servicios
rm src/lib/api/services/sla-service.ts

# Hooks
rm src/shared/hooks/sla-hooks.ts

# Assets
rm public/next.svg
rm public/vercel.svg
rm public/file.svg
rm public/globe.svg
rm public/window.svg

# Directorio duplicado (CUIDADO: verificar que no hay código único)
rm -rf src/app/(app)/analysis/
```

### 🟡 Revisar Antes de Eliminar (MEDIA confianza)

1. **workflow-service.ts** y **workflow-hooks.ts** - ¿Se habilitarán workflows?
2. **document-service.ts** y **document-hooks.ts** - ¿Se habilitarán documents?
3. **schemas.ts** - Consolidar o eliminar esquemas duplicados
4. **status-badge.tsx** - Verificar uso de incident-card.tsx

### 🔴 Mantener (Funcionalidad Futura)

- Carpeta `/workflows/**` - Funcionalidad completa deshabilitada
- Carpeta `/documents/**` - Funcionalidad completa deshabilitada

---

## Estadísticas

- **Total de archivos investigados**: 207 archivos TS/TSX
- **Archivos probablemente no usados**: ~15-20
- **Estimación de código eliminable**: ~10-15% del código de componentes y servicios
- **SVGs no utilizados**: 5 archivos (~10KB)

---

## Notas Importantes

1. **Antes de eliminar `/analysis/`**: Verificar que no haya código único que no esté en `/root-cause-analysis/`

2. **Servicios de workflow/documents**: Estos tienen implementación completa. Solo están deshabilitados en la UI. Eliminar solo si se confirma que no se usarán.

3. **Los imports en index.ts**: Algunos servicios se exportan en `index.ts` pero no se usan. Después de eliminar, limpiar los exports.
