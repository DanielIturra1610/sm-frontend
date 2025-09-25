# Dockerfile para Stegmaier Management Frontend
# Multi-stage build para optimizar imagen de producciÃ³n

# ============================================================================
# STAGE 1: Builder
# ============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@8.15.0

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias usando pnpm pero de forma mÃ¡s estable
RUN pnpm config set store-dir /app/.pnpm-store
RUN pnpm install --frozen-lockfile --no-optional

# Copiar cÃ³digo fuente
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Valores por defecto para las variables públicas necesarias durante el build
ARG NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_NAME="Stegmaier Safety Management"
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG NEXT_PUBLIC_APP_DESCRIPTION="Comprehensive industrial safety document management system"
ARG NEXT_PUBLIC_MAX_FILE_SIZE=10485760
ARG NEXT_PUBLIC_ALLOWED_FILE_TYPES="pdf,doc,docx,jpg,jpeg,png"
ARG NEXT_PUBLIC_SHOW_API_LOGS=false
ARG NEXT_PUBLIC_DEBUG_MODE=false
ARG NEXT_PUBLIC_DEFAULT_TENANT=stegmaier
ARG NEXT_PUBLIC_ENABLE_TENANT_SIGNUP=true
ARG NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS=true
ARG NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS=true
ARG NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION=true
ARG NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE=true
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXTAUTH_SECRET=change-me-in-prod

RUN cat <<EOF > .env.local
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME}"
NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}
NEXT_PUBLIC_APP_DESCRIPTION="${NEXT_PUBLIC_APP_DESCRIPTION}"
NEXT_PUBLIC_MAX_FILE_SIZE=${NEXT_PUBLIC_MAX_FILE_SIZE}
NEXT_PUBLIC_ALLOWED_FILE_TYPES=${NEXT_PUBLIC_ALLOWED_FILE_TYPES}
NEXT_PUBLIC_SHOW_API_LOGS=${NEXT_PUBLIC_SHOW_API_LOGS}
NEXT_PUBLIC_DEBUG_MODE=${NEXT_PUBLIC_DEBUG_MODE}
NEXT_PUBLIC_DEFAULT_TENANT=${NEXT_PUBLIC_DEFAULT_TENANT}
NEXT_PUBLIC_ENABLE_TENANT_SIGNUP=${NEXT_PUBLIC_ENABLE_TENANT_SIGNUP}
NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS=${NEXT_PUBLIC_ENABLE_FIVE_WHYS_ANALYSIS}
NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS=${NEXT_PUBLIC_ENABLE_FISHBONE_ANALYSIS}
NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION=${NEXT_PUBLIC_ENABLE_DOCUMENT_GENERATION}
NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE=${NEXT_PUBLIC_ENABLE_WORKFLOW_ENGINE}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
EOF

# Build de la aplicación usando pnpm
RUN pnpm build

# ============================================================================
# STAGE 3: Runner (ProducciÃ³n)
# ============================================================================
FROM node:20-alpine AS production
WORKDIR /app

# Instalar pnpm globalmente para producciÃ³n
RUN npm install -g pnpm@8.15.0

# Variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos de configuraciÃ³n
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Instalar solo dependencias de producciÃ³n
RUN pnpm install --prod --frozen-lockfile

# Copiar archivos de configuraciÃ³n y build desde builder
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node /app/healthcheck.js || exit 1

# Crear script de health check
USER root
RUN echo 'const http = require("http"); \
const options = { hostname: "localhost", port: 3000, path: "/api/health", method: "GET", timeout: 2000 }; \
const req = http.request(options, (res) => { \
  process.exit(res.statusCode === 200 ? 0 : 1); \
}); \
req.on("error", () => process.exit(1)); \
req.on("timeout", () => { req.destroy(); process.exit(1); }); \
req.end();' > /app/healthcheck.js

USER nextjs

# Comando de inicio
CMD ["pnpm", "start"]

# ============================================================================
# STAGE 4: Development
# ============================================================================
FROM node:20-alpine AS development
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Variables de entorno para desarrollo
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar archivos de configuraciÃ³n
COPY package.json pnpm-lock.yaml ./

# Instalar todas las dependencias (dev + prod)
RUN pnpm install --frozen-lockfile

# Copiar cÃ³digo fuente
COPY . .

# Exponer puerto de desarrollo
EXPOSE 3000

# Comando de desarrollo con hot reload
CMD ["pnpm", "dev"]

# ============================================================================
# Instrucciones de uso:
# ============================================================================
#
# Build imagen de desarrollo:
#   docker build --target development -t stegmaier-frontend:dev .
#
# Build imagen de producciÃ³n:
#   docker build --target production -t stegmaier-frontend:prod .
#
# Ejecutar en desarrollo:
#   docker run -p 3000:3000 -v $(pwd):/app stegmaier-frontend:dev
#
# Ejecutar en producciÃ³n:
#   docker run -p 3000:3000 stegmaier-frontend:prod
#
# ============================================================================
