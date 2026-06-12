# ============================================================
# Fluxion ML Service - Production Dockerfile
# Multi-stage build; runs the lightweight serve.py HTTP/metrics server.
# ============================================================

# ---------- Stage 1: builder ----------
FROM python:3.12-slim AS builder

ARG PYTHON_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -r fluxion && useradd -r -g fluxion -d /app -s /sbin/nologin fluxion

WORKDIR /app

COPY --from=builder /install /usr/local
COPY --chown=fluxion:fluxion . .

# Model + log directories (also mounted as volumes by docker-compose)
RUN mkdir -p /app/models /app/logs && chown -R fluxion:fluxion /app

USER fluxion

# Health endpoint served by serve.py on PORT (default 8000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000 9091

CMD ["python", "serve.py"]
