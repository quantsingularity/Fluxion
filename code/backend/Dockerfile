# ============================================================
# Fluxion Backend – Production Dockerfile
# Multi-stage build for minimal final image
# ============================================================

# ---------- Stage 1: builder ----------
FROM python:3.12-slim AS builder

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Install Python dependencies into a prefix
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim AS runtime

# Runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r fluxion && useradd -r -g fluxion -d /app -s /sbin/nologin fluxion

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY --chown=fluxion:fluxion . .

# Create required directories
RUN mkdir -p /app/logs /app/tmp && chown -R fluxion:fluxion /app

USER fluxion

# Health check (uses PORT, default 8000)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

ENV PORT=8000
EXPOSE ${PORT}

# Default command - honors the PORT env var so docker-compose (PORT=5000) and
# standalone runs both bind the right port. Shell form is required for ${PORT}
# expansion. Override with gunicorn for production if desired.
CMD uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers 1 \
    --log-level info \
    --access-log
