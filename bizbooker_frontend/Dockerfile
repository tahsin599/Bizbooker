# Stage 1: Builder with increased memory
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (include devDependencies for build tools)
RUN npm ci --silent

# Copy source code
COPY . .

# Build with 4GB memory allocation
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14.2.1

# Copy only built files from builder
COPY --from=builder /app/build ./build

# Non-root user setup
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactjs -u 1001 && \
    chown -R reactjs:nodejs /app

USER reactjs

EXPOSE 3000

# Healthcheck (fixed to use localhost)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://57.158.224.25:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]

# Development stage
FROM  node:18-slim as development

WORKDIR /app

COPY package*.json ./

# Changed from 'npm ci' to 'npm install' to generate/update package-lock.json if needed
RUN npm install

# The volume mapping in docker-compose will override this in dev
COPY . ./

EXPOSE 3000


CMD ["npm", "start"]

