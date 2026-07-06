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
COPY package*.json ./

# Install only production dependencies to keep the image slim and secure
RUN npm ci --omit=dev

# Copy compiled bundles and static assets from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the designated ingress container port
EXPOSE 3000

# Start the full-stack Express server
CMD ["npm", "run", "start"]
