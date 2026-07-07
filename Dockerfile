# ==========================================
# Stage 1: Build & Compilation Environment
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the entire source tree
COPY . .

# Compile and bundle the application
# Generates client-side static assets in dist/ and server bundle in dist/server.cjs
RUN npm run build

# ==========================================
# Stage 2: Production Execution Environment
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only production package manifests
COPY --chown=node:node package*.json ./

# Install only production dependencies to keep the image slim and secure
RUN npm ci --omit=dev

# Copy compiled bundles and static assets from the builder stage
COPY --from=builder --chown=node:node /app/dist ./dist

# Change owner of working directory to node user recursively
RUN chown -R node:node /app

# Switch to the non-root node user
USER node

# Expose the designated ingress container port
EXPOSE 3000

# Implement Docker container healthcheck using lightweight liveness probe endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health/liveness || exit 1

# Start the full-stack Express server
CMD ["npm", "run", "start"]
