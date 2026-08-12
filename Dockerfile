# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build Vite frontend and bundled server.cjs
RUN bun run build

# Stage 2: Production runner
FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and dist files from builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Start production application
CMD ["bun", "dist/server.cjs"]

