# syntax=docker/dockerfile:1

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_INVOICE_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_INVOICE_API_URL=${NEXT_PUBLIC_INVOICE_API_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node scripts/normalize-text.mjs
RUN node scripts/check-utf8.mjs
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ARG NEXT_PUBLIC_INVOICE_API_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_INVOICE_API_URL=${NEXT_PUBLIC_INVOICE_API_URL}
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "run", "start"]
