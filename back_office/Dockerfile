# ============================================================
#  Gamefy Back-Office — Optimized Multi-Stage Dockerfile
#  Stack: React 19 · TypeScript · Vite 6 · TailwindCSS 4 · Nginx
# ============================================================

# ─── Stage 1: Dependencies ──────────────────────────────────
# Installs node_modules in an isolated layer so they are
# only re-installed when package.json / package-lock change.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# ─── Stage 2: Build ─────────────────────────────────────────
# Compiles TypeScript and creates the production Vite bundle.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Bring in cached node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# ── Build-time env var (override at build with --build-arg) ──
# Only VITE_API_BASE_URL is overridable (changes between localhost / production).
# All other keys (Google Client ID) are read from .env.production by Vite.
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# TypeScript check + Vite production build
RUN npm run build

# ─── Stage 3: Runtime (Nginx) ───────────────────────────────
# Serves the static dist/ folder via lightweight Nginx.
# No Node.js runtime needed — pure static file serving.
# ─────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runtime

# ── Custom Nginx config for SPA routing ──
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Copy the built static files ──
COPY --from=build /app/dist /usr/share/nginx/html

# ── Non-root user ──
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

LABEL maintainer="Gamefy Team" \
      org.opencontainers.image.title="gamefy-back-office" \
      org.opencontainers.image.description="Gamefy gaming center admin dashboard"

CMD ["nginx", "-g", "daemon off;"]
