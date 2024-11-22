# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./db/migrations
COPY --from=builder /app/src/db/seeds ./db/seeds

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"] 