# ============================================================
# Fluxion Web Frontend - Production Dockerfile
# Multi-stage build: Vite build, then served by nginx on :80
# ============================================================

# ---------- Stage 1: build ----------
FROM node:20-alpine AS build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Install dependencies first for better layer caching.
# Dev dependencies (vite, plugins) are required to build, so install all.
COPY package*.json ./
RUN npm ci --include=dev

# Build the static site (outputs to /app/dist per vite.config.js)
COPY . .
RUN npm run build

# ---------- Stage 2: runtime (nginx) ----------
FROM nginx:1.25-alpine AS runtime

# SPA-friendly nginx config: serve static assets and fall back to index.html
# for client-side routes. Runs on port 80 (matches docker-compose healthcheck).
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name _;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '    location /assets/ {' \
    '        expires 1y;' \
    '        add_header Cache-Control "public, immutable";' \
    '    }' \
    '}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
