# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# Install build dependencies for native modules (pdf-parse, bcrypt, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Builder (generate Prisma client) ───────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
# NODE_TLS_REJECT_UNAUTHORIZED=0 is only needed for local builds behind a TLS-inspecting proxy.
# Railway's build environment does not require this.
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate

# ─── Stage 3: Runner ─────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl dumb-init && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs appuser

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy generated Prisma client from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source
COPY prisma ./prisma
COPY src ./src

# Create uploads directory and set permissions
RUN mkdir -p uploads && chown -R appuser:nodejs /app

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER appuser

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
