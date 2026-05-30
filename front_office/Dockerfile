# ============================================================
#  Gamefy Front-Office — Optimized Multi-Stage Dockerfile
#  Stack: React 19 · Vite 7 · TailwindCSS 4 · Nginx
# ============================================================

# ─── Stage 1: Dependencies ──────────────────────────────────
# Installs node_modules in an isolated layer so they are
# only re-installed when package.json / package-lock change.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copy only dependency manifests for optimal layer caching
COPY package.json package-lock.json ./

# ci = clean install (deterministic, faster, respects lockfile)
RUN npm ci --ignore-scripts

# ─── Stage 2: Build ─────────────────────────────────────────
# Builds the production-optimized static bundle with Vite.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Bring in cached node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# ── Build-time env var (override at build with --build-arg) ──
# Only VITE_API_BASE_URL is overridable (changes between localhost / production).
# All other keys (Groq, Google, Stripe, reCAPTCHA) are read automatically
# from .env.production by Vite during "npm run build".
ARG VITE_API_BASE_URL=http://localhost:8080/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle
RUN npm run build

# ─── Stage 3: Runtime (Nginx) ───────────────────────────────
# Serves the static dist/ folder via a lightweight Nginx
# reverse proxy — no Node.js runtime needed at all.
# ─────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runtime

# ── Custom Nginx config for SPA routing ──
# React Router needs all routes to fallback to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Copy the built static files ──
COPY --from=build /app/dist /usr/share/nginx/html

# ── Non-root user (Nginx Alpine supports this) ──
RUN chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# ── Expose port 80 ──
EXPOSE 80

# ── Health check ──
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# ── Labels ──
LABEL maintainer="Gamefy Team" \
      org.opencontainers.image.title="gamefy-front-office" \
      org.opencontainers.image.description="Gamefy gaming center front-office React SPA"

CMD ["nginx", "-g", "daemon off;"]
