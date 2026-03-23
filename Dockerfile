# =============================================
# 1. Dependencies
# =============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# =============================================
# 2. Builder
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment untuk production build Next.js 16
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js 16 dengan Turbopack
RUN pnpm build

# Debug: List files untuk memastikan build berhasil
RUN echo "=== Build Output ===" && \
    ls -la .next/ && \
    echo "=== Standalone Output ===" && \
    ls -la .next/standalone/ && \
    echo "=== Static Output ===" && \
    ls -la .next/static/

# =============================================
# 3. Runner
# =============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5003
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output FIRST
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy ALL static directories
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Debug: List what we copied
RUN echo "=== Checking copied files ===" && \
    ls -la .next/ && \
    echo "=== Static directory ===" && \
    ls -la .next/static/ && \
    echo "=== Build ID ===" && \
    cat .next/BUILD_ID && \
    echo "=== Build ID directory ===" && \
    ls -la .next/static/$(cat .next/BUILD_ID)/ || echo "Build ID directory not found!"

USER nextjs

EXPOSE 5003

ENV HOSTNAME="0.0.0.0"
ENV PORT="5003"

CMD ["node", "server.js"]