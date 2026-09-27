FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
ENV NODE_OPTIONS=--max-old-space-size=384 \
    npm_config_maxsockets=1 \
    npm_config_progress=false \
    npm_config_update_notifier=false
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund --prefer-offline
RUN mkdir -p /app/.build-tools && cd /app/.build-tools \
    && printf '{"private":true,"type":"module"}\n' > package.json \
    && npm install --no-save --package-lock=false --no-audit --no-fund --prefer-offline \
      @tailwindcss/postcss@4.2.1 \
      @types/node@22.19.19 \
      @types/pg@8.23.1 \
      @types/react@19.2.14 \
      @types/react-dom@19.2.3 \
      tailwindcss@4.2.1 \
      tw-animate-css@1.4.0 \
      typescript@5.9.3 \
    && mkdir -p /app/node_modules/@tailwindcss /app/node_modules/@types \
    && ln -s /app/.build-tools/node_modules/@tailwindcss/postcss /app/node_modules/@tailwindcss/postcss \
    && ln -s /app/.build-tools/node_modules/tailwindcss /app/node_modules/tailwindcss \
    && ln -s /app/.build-tools/node_modules/tw-animate-css /app/node_modules/tw-animate-css \
    && ln -s /app/.build-tools/node_modules/typescript /app/node_modules/typescript \
    && ln -s /app/.build-tools/node_modules/@types/node /app/node_modules/@types/node \
    && ln -s /app/.build-tools/node_modules/@types/pg /app/node_modules/@types/pg \
    && ln -s /app/.build-tools/node_modules/@types/react /app/node_modules/@types/react \
    && ln -s /app/.build-tools/node_modules/@types/react-dom /app/node_modules/@types/react-dom

FROM dependencies AS builder
ENV NODE_OPTIONS=--max-old-space-size=768
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN node scripts/write-build-info.mjs && test -n "$NEXT_PUBLIC_SUPABASE_URL" && test -n "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" && npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/scripts ./scripts
COPY --from=builder --chown=node:node /app/lib ./lib
COPY --from=builder --chown=node:node /app/drizzle/postgres ./drizzle/postgres
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","scripts/start-container.mjs"]
