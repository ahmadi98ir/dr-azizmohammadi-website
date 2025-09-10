# Multi-stage Dockerfile for Next.js 15 app on Coolify
# - Uses standalone output for smaller runtime image
# - Runs Prisma generate at build; optional migrate at start if USE_PRISMA=1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-bullseye AS base

# Set working dir
WORKDIR /app

# Install dependencies only (leverage Docker layer cache)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build app
FROM deps AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
# Generate Prisma client even if optional; harmless when not used
RUN npx prisma generate || true
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd -r nextjs && useradd -r -g nextjs nextjs

WORKDIR /app

# Copy only required files from build stage (standalone output)
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Prisma schema for migrate deploy
COPY --from=build /app/prisma ./prisma
# Prisma engines (if generated)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Ensure data dirs exist and are writable (for JSON fallback or SQLite)
RUN mkdir -p /app/data /app/prisma && chown -R nextjs:nextjs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Optional Prisma migrate in production when enabled
# Coolify can override CMD; this is a safe default
CMD sh -lc "( [ \"$USE_PRISMA\" = \"1\" ] && npx prisma migrate deploy || true ) && node server.js"
