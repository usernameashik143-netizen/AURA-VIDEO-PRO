# ==============================================================================
# AURA VIDEO PRO — PRODUCTION MULTI-STAGE DOCKERFILE
# Architecture: Unified Full-Stack Container (Vite Frontend + Node.js API + FFmpeg)
# ==============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-bookworm-slim AS client-builder
WORKDIR /build/client

# Copy package manifests and install dependencies
COPY client/package*.json ./
RUN npm ci || npm install

# Copy source and build static bundle
COPY client/ ./
RUN node node_modules/typescript/bin/tsc && node node_modules/vite/bin/vite.js build

# --- Stage 2: Build Backend ---
FROM node:20-bookworm-slim AS server-builder
WORKDIR /build/server

# Copy package manifests and install dependencies
COPY server/package*.json ./
RUN npm ci || npm install

# Copy source and compile TypeScript
COPY server/ ./
RUN node node_modules/typescript/bin/tsc

# --- Stage 3: Production Runtime ---
FROM node:20-bookworm-slim AS runner

# Install system FFmpeg, FFprobe, and required fonts/codecs
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    fonts-freefont-ttf \
    && rm -rf /var/lib/apt/lists/*

# Verify system FFmpeg and FFprobe installation
RUN ffmpeg -version && ffprobe -version

WORKDIR /app

# Setup server production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled server code and font asset
COPY --from=server-builder /build/server/dist ./server/dist
COPY server/arial.ttf ./server/arial.ttf

# Copy pre-seeded sample media and background music
COPY server/storage/seeds ./server/storage/seeds

# Copy compiled frontend distribution
COPY --from=client-builder /build/client/dist ./client/dist

# Pre-create runtime storage directories
RUN mkdir -p /app/server/storage/uploads \
             /app/server/storage/thumbnails \
             /app/server/storage/exports \
             /app/server/storage/seeds

# Runtime environment configuration
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000
ENV CLIENT_DIST_DIR=/app/client/dist
ENV STORAGE_DIR=/app/server/storage
ENV NODE_OPTIONS="--max-old-space-size=128"

WORKDIR /app/server
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start unified production server
CMD ["node", "dist/index.js"]
