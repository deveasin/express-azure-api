# ─── Stage 1: Dependencies ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# ─── Stage 2: Production Image ────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY src/ ./src/
COPY package.json ./

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]