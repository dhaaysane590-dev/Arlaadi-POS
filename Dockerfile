# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend and bundled server.cjs
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package.json for production dependencies if needed
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built dist files from builder stage
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Start production application
CMD ["node", "dist/server.cjs"]
