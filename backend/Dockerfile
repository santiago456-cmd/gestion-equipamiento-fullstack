# ---- base: dependencias compartidas entre dev y prod ----
FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- dev: hot-reload, código montado por volumen ----
FROM base AS dev
COPY . .
RUN chmod +x ./docker/dev-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["sh", "./docker/dev-entrypoint.sh"]

# ---- prod: build optimizado, sin devDependencies ----
FROM base AS build
COPY . .
RUN pnpm exec tsc

FROM node:24-alpine AS prod
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "--import", "./dist/instrumentation.js", "./dist/app.js"]